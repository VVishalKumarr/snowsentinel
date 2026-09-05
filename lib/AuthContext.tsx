"use client";

// AuthContext.tsx — client-side session state for the phone+OTP login flow.
// The token is an opaque server-issued session id (see lib/auth.ts), stored
// in localStorage so it survives reloads. OTP delivery itself is DEMO MODE
// (no SMS provider configured) — see app/api/auth/request-otp/route.ts.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface AuthUser {
  id: number;
  name: string;
  phoneNumber: string;
  uniqueCode: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  requestOtp: (phone: string) => Promise<{ demoMode: boolean; otp?: string }>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "snowsentinel:authToken";
const USER_KEY = "snowsentinel:authUser";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = window.localStorage.getItem(TOKEN_KEY);
      const storedUser = window.localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    try {
      window.localStorage.setItem(TOKEN_KEY, nextToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore
    }
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not send code");
    return { demoMode: !!data.demoMode, otp: data.otp };
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, otp: string, name?: string) => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, otp, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      persist(data.token, data.user);
    },
    [persist]
  );

  const logout = useCallback(async () => {
    if (token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  }, [token]);

  const authedFetch = useCallback(
    (input: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      if (token) headers.set("authorization", `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    },
    [token]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, requestOtp, verifyOtp, logout, authedFetch }),
    [user, token, loading, requestOtp, verifyOtp, logout, authedFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
