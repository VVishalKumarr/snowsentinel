// pushService.ts — the single entry point every server-side feature (the
// hazard alert engine, Family SOS) calls to actually reach a user's
// device(s), regardless of platform. Renders the notification text in the
// RECIPIENT's own saved language (lib/i18n/index.tsx's translate()) since
// the device may receive this while the app itself isn't running to do
// client-side translation. Never throws — a misconfigured or unreachable
// push backend degrades to "notification not delivered", not a broken app.

import { findUserById } from "./db";
import { getActiveDeviceTokens, deactivateToken, type DeviceToken } from "./deviceTokens";
import { sendFcm } from "./push/fcm";
import { sendWebPush } from "./push/webpush";
import { translate, isLanguageCode } from "./i18n/shared";
import type { TranslationKey } from "./i18n/en";

export type NotificationChannel = "CRITICAL_ALERTS" | "HIGH_ALERTS" | "GENERAL_ALERTS" | "FAMILY_SOS";

export interface PushPayload {
  channel: NotificationChannel;
  titleKey: TranslationKey;
  titleVars?: Record<string, string | number>;
  bodyKey: TranslationKey;
  bodyVars?: Record<string, string | number>;
  data: Record<string, string>;
}

export interface PushDeliveryResult {
  userId: number;
  attempted: number;
  delivered: number;
}

async function dispatchToToken(token: DeviceToken, title: string, body: string, payload: PushPayload): Promise<boolean> {
  if (token.platform === "android") {
    const result = await sendFcm(token.token, title, body, payload.channel, payload.data);
    if (result.invalidToken) await deactivateToken(token.id);
    return result.ok;
  }
  const result = await sendWebPush(token.token, title, body, payload.channel, payload.data);
  if (result.invalidSubscription) await deactivateToken(token.id);
  return result.ok;
}

export async function sendPushToUser(userId: number, payload: PushPayload): Promise<PushDeliveryResult> {
  const [user, tokens] = await Promise.all([findUserById(userId), getActiveDeviceTokens(userId)]);
  if (!user || tokens.length === 0) return { userId, attempted: 0, delivered: 0 };

  const lang = isLanguageCode(user.preferred_language) ? user.preferred_language : "en";
  const title = translate(lang, payload.titleKey, payload.titleVars);
  const body = translate(lang, payload.bodyKey, payload.bodyVars);

  const results = await Promise.all(tokens.map((t) => dispatchToToken(t, title, body, payload)));
  return { userId, attempted: tokens.length, delivered: results.filter(Boolean).length };
}

export async function sendPushToUsers(userIds: number[], payload: PushPayload): Promise<PushDeliveryResult[]> {
  return Promise.all(userIds.map((id) => sendPushToUser(id, payload)));
}
