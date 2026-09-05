// db.ts — real, persistent storage for user-generated data (accounts,
// family network, SOS history), backed by Postgres (Neon, via Vercel
// Marketplace). This is intentionally separate from lib/demoData.ts and
// lib/emergencyData.ts, which stay as static seed/demo data — see each
// file's header comment. Nothing in this file is demo data.

import { sql } from "@vercel/postgres";

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          phone_number TEXT UNIQUE NOT NULL,
          unique_code TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          expires_at TIMESTAMPTZ NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id SERIAL PRIMARY KEY,
          phone_number TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          consumed BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS family_connections (
          id SERIAL PRIMARY KEY,
          owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          family_member_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          relationship TEXT,
          status TEXT NOT NULL DEFAULT 'PENDING',
          safety_status TEXT NOT NULL DEFAULT 'NOT_CHECKED_IN',
          share_location BOOLEAN NOT NULL DEFAULT FALSE,
          last_location_lat DOUBLE PRECISION,
          last_location_lng DOUBLE PRECISION,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_check_in TIMESTAMPTZ,
          check_in_requested_at TIMESTAMPTZ,
          UNIQUE(owner_user_id, family_member_user_id)
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sos_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'QUEUED',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
    })();
  }
  return schemaReady;
}

export { sql };

export interface DbUser {
  id: number;
  name: string;
  phone_number: string;
  unique_code: string;
  created_at: string;
}

export async function generateUniqueCode(): Promise<string> {
  await ensureSchema();
  for (let attempt = 0; attempt < 25; attempt++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await sql<{ id: number }>`SELECT id FROM users WHERE unique_code = ${code}`;
    if (existing.rows.length === 0) return code;
  }
  throw new Error("Could not generate a unique code — please retry");
}

export async function findUserByPhone(phone: string): Promise<DbUser | null> {
  await ensureSchema();
  const { rows } = await sql<DbUser>`SELECT * FROM users WHERE phone_number = ${phone}`;
  return rows[0] ?? null;
}

export async function findUserByCode(code: string): Promise<DbUser | null> {
  await ensureSchema();
  const cleaned = code.replace(/[^0-9]/g, "");
  const { rows } = await sql<DbUser>`SELECT * FROM users WHERE unique_code = ${cleaned}`;
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<DbUser | null> {
  await ensureSchema();
  const { rows } = await sql<DbUser>`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] ?? null;
}
