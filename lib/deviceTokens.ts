// deviceTokens.ts — one row per device/browser a user has enabled push
// notifications on. A user can have any number of active tokens (phone +
// laptop browser + tablet, etc.) — every push send fans out to all of a
// user's active tokens, not just "the" device.

import { sql, ensureSchema } from "./db";

export type DevicePlatform = "android" | "web";

export interface DeviceToken {
  id: number;
  user_id: number;
  platform: DevicePlatform;
  token: string;
  active: boolean;
}

export async function registerDeviceToken(userId: number, platform: DevicePlatform, token: string): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO device_tokens (user_id, platform, token, active, updated_at)
    VALUES (${userId}, ${platform}, ${token}, TRUE, now())
    ON CONFLICT (user_id, platform, token)
    DO UPDATE SET active = TRUE, updated_at = now()
  `;
}

export async function unregisterDeviceToken(userId: number, token: string): Promise<void> {
  await ensureSchema();
  await sql`UPDATE device_tokens SET active = FALSE WHERE user_id = ${userId} AND token = ${token}`;
}

export async function deactivateToken(tokenId: number): Promise<void> {
  await ensureSchema();
  await sql`UPDATE device_tokens SET active = FALSE WHERE id = ${tokenId}`;
}

export async function getActiveDeviceTokens(userId: number): Promise<DeviceToken[]> {
  await ensureSchema();
  const { rows } = await sql<DeviceToken>`
    SELECT id, user_id, platform, token, active FROM device_tokens
    WHERE user_id = ${userId} AND active = TRUE
  `;
  return rows;
}
