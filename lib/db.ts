// db.ts — real, persistent storage for user-generated data (accounts,
// family network, SOS history), backed by Postgres (Neon, via Vercel
// Marketplace). This is intentionally separate from lib/demoData.ts and
// lib/emergencyData.ts, which stay as static seed/demo data — see each
// file's header comment. Nothing in this file is demo data.
//
// Auth model: username + password (hashed — see lib/auth.ts). The OTP/
// phone-based login this project used earlier has been removed; the
// `phone_number` and `unique_code` columns are kept (nullable) only so any
// pre-existing rows and the now-secondary "your ID" display don't break —
// they play no role in authentication or in finding a user to connect
// with, which is username-based now.

import { sql } from "@vercel/postgres";

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          phone_number TEXT,
          unique_code TEXT UNIQUE,
          username TEXT,
          password_hash TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      // Migrate columns/constraints for databases created by earlier
      // versions of this schema (phone-based auth had phone_number as
      // NOT NULL UNIQUE; username-based auth needs neither true anymore).
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
      await sql`ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL`;
      await sql`ALTER TABLE users ALTER COLUMN unique_code DROP NOT NULL`;
      await sql`
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_number_key') THEN
            ALTER TABLE users DROP CONSTRAINT users_phone_number_key;
          END IF;
        END $$;
      `;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx ON users (LOWER(username)) WHERE username IS NOT NULL`;

      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          expires_at TIMESTAMPTZ NOT NULL
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
          accepted_at TIMESTAMPTZ,
          last_check_in TIMESTAMPTZ,
          check_in_requested_at TIMESTAMPTZ,
          UNIQUE(owner_user_id, family_member_user_id)
        );
      `;
      await sql`ALTER TABLE family_connections ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ`;
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
      // resolved_at: set by the SENDER only, once they mark the emergency
      // over. Distinct from a recipient acknowledging (below) — one family
      // member acknowledging doesn't mean the situation is resolved.
      await sql`ALTER TABLE sos_requests ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ`;

      await sql`
        CREATE TABLE IF NOT EXISTS sos_recipients (
          id SERIAL PRIMARY KEY,
          sos_request_id INTEGER NOT NULL REFERENCES sos_requests(id) ON DELETE CASCADE,
          recipient_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          viewed BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      // Real per-recipient notification state — UNREAD until the recipient
      // opens it, ACKNOWLEDGED once they explicitly confirm. Kept separate
      // from `viewed` (now superseded but left in place) to avoid a risky
      // column rename on a live table.
      await sql`ALTER TABLE sos_recipients ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'UNREAD'`;
      await sql`ALTER TABLE sos_recipients ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`;
      await sql`ALTER TABLE sos_recipients ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ`;
    })();
  }
  return schemaReady;
}

export { sql };

export interface DbUser {
  id: number;
  name: string;
  phone_number: string | null;
  unique_code: string | null;
  username: string;
  password_hash: string;
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

export async function findUserByUsername(username: string): Promise<DbUser | null> {
  await ensureSchema();
  const { rows } = await sql<DbUser>`SELECT * FROM users WHERE LOWER(username) = LOWER(${username})`;
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<DbUser | null> {
  await ensureSchema();
  const { rows } = await sql<DbUser>`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function createUser(params: { name: string; username: string; passwordHash: string }): Promise<DbUser> {
  await ensureSchema();
  const uniqueCode = await generateUniqueCode();
  const { rows } = await sql<DbUser>`
    INSERT INTO users (name, username, password_hash, unique_code)
    VALUES (${params.name}, ${params.username}, ${params.passwordHash}, ${uniqueCode})
    RETURNING *
  `;
  return rows[0];
}
