"use client";

// AuthContext.tsx — client-side session state for the username + password
// login flow. The server also sets an httpOnly session cookie (used by
// proxy.ts for page-level route protection); this context separately
// keeps the token in memory + localStorage so existing API calls can keep
// using an Authorization header (see authedFetch), and so the UI knows
// "am I logged in" instantly without waiting on a cookie-only round trip.
// No password ever passes through localStorage — only the opaque session
// token, which the server can revoke at any time via logout.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AuthApiError, type AuthErrorCode } from "./authErrors";

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  uniqueCode: string | null;
}

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "snowsentinel:authToken";
const USER_KEY = "snowsentinel:authUser";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  const authedFetch = useCallback(
    (input: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      if (token) headers.set("authorization", `Bearer ${token}`);
      return fetch(input, { ...init, headers, credentials: "include" });
    },
    [token]
  );

  // On mount: trust a locally-cached token only provisionally, then confirm
  // with the server (handles logout-elsewhere, expiry, or a forged value).
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      let storedToken: string | null = null;
      try {
        storedToken = window.localStorage.getItem(TOKEN_KEY);
      } catch {
        // ignore
      }
      if (!storedToken) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { authorization: `Bearer ${storedToken}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("invalid session");
        const data = await res.json();
        if (!cancelled) {
          setToken(storedToken);
          setUser(data.user);
          setStatus("authenticated");
        }
      } catch {
        try {
          window.localStorage.removeItem(TOKEN_KEY);
          window.localStorage.removeItem(USER_KEY);
        } catch {
          // ignore
        }
        if (!cancelled) setStatus("unauthenticated");
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setStatus("authenticated");
    try {
      window.localStorage.setItem(TOKEN_KEY, nextToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new AuthApiError((data.code as AuthErrorCode) || "UNKNOWN", data.error || "Login failed");
      persist(data.token, data.user);
    },
    [persist]
  );

  const register = useCallback(
    async (name: string, username: string, password: string, confirmPassword: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, username, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new AuthApiError((data.code as AuthErrorCode) || "UNKNOWN", data.error || "Registration failed");
      persist(data.token, data.user);
    },
    [persist]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    }).catch(() => {});
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      loading: status === "checking",
      login,
      register,
      logout,
      authedFetch,
    }),
    [user, token, status, login, register, logout, authedFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
