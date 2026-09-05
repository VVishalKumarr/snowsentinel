// auth.ts — session management for the simple phone+OTP login flow.
// Demo-mode OTP: see generateOtp() below and lib/db.ts's otp_codes table.
// Sessions are real (stored server-side in Postgres, random opaque token
// held client-side) — only the OTP delivery mechanism is a demo stand-in
// for a real SMS provider.

import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { sql, ensureSchema, findUserById, type DbUser } from "./db";

const SESSION_TTL_DAYS = 30;
const OTP_TTL_MINUTES = 5;

export function generateSessionToken(): string {
  return randomBytes(24).toString("hex");
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createSession(userId: number): Promise<string> {
  await ensureSchema();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
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

export async function storeOtp(phoneNumber: string, code: string): Promise<void> {
  await ensureSchema();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await sql`
    INSERT INTO otp_codes (phone_number, code, expires_at)
    VALUES (${phoneNumber}, ${code}, ${expiresAt.toISOString()})
  `;
}

export async function verifyAndConsumeOtp(phoneNumber: string, code: string): Promise<boolean> {
  await ensureSchema();
  const { rows } = await sql<{ id: number }>`
    SELECT id FROM otp_codes
    WHERE phone_number = ${phoneNumber} AND code = ${code} AND consumed = FALSE AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const otp = rows[0];
  if (!otp) return false;
  await sql`UPDATE otp_codes SET consumed = TRUE WHERE id = ${otp.id}`;
  return true;
}

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}

export async function getUserFromRequest(req: NextRequest): Promise<DbUser | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return getUserFromToken(token);
}
