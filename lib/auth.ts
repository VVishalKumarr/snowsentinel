// auth.ts — session management for the username + password login flow.
// The phone/OTP system this project used earlier has been removed
// entirely: no OTP generation, storage, or verification happens anywhere.
// Passwords are never stored in plain text — see hashPassword/verifyPassword
// below (Node's built-in scrypt, salted per-password; no plaintext or
// reversible encryption, and nothing password-related ever reaches the
// frontend).

import type { NextRequest } from "next/server";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { sql, ensureSchema, findUserById, type DbUser } from "./db";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "./sessionConstants";

export { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS };

export function generateSessionToken(): string {
  return randomBytes(24).toString("hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derivedHex] = stored.split(":");
  if (!salt || !derivedHex) return false;
  const derived = Buffer.from(derivedHex, "hex");
  const supplied = scryptSync(password, salt, 64);
  return derived.length === supplied.length && timingSafeEqual(derived, supplied);
}

export async function createSession(userId: number): Promise<string> {
  await ensureSchema();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `;
  return token;
}

export async function getUserFromToken(token: string | null | undefined): Promise<DbUser | null> {
  if (!token) return null;
  await ensureSchema();
  const { rows } = await sql<{ user_id: number; expires_at: string }>`
    SELECT user_id, expires_at FROM sessions WHERE token = ${token}
  `;
  const session = rows[0];
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
    return null;
  }
  return findUserById(session.user_id);
}

export async function deleteSession(token: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");
}

// Auth for API routes: accepts either the Authorization header (used by
// authedFetch from the client) or the httpOnly session cookie (set on
// login/register, used by middleware for page-level gating) — either one
// resolves to the same sessions table.
export async function getUserFromRequest(req: NextRequest): Promise<DbUser | null> {
  const headerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (headerToken) return getUserFromToken(headerToken);
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return getUserFromToken(cookieToken);
}
