// webpush.ts — real Web Push (RFC 8030) for the hosted website, using the
// VAPID keys in .env.local (self-generated locally via `web-push`'s
// generateVAPIDKeys() — no external account needed, unlike Firebase). This
// delivers to the browser's own push service (e.g. FCM for Chrome, Mozilla
// autopush for Firefox) so the site's service worker can show a system
// notification even when no SnowSentinel tab is open, as long as the
// browser itself is running.

import webpush from "web-push";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function isWebPushConfigured(): boolean {
  return ensureConfigured();
}

export interface WebPushResult {
  ok: boolean;
  invalidSubscription?: boolean;
  notConfigured?: boolean;
}

export async function sendWebPush(
  subscriptionJson: string,
  title: string,
  body: string,
  channelId: string,
  data: Record<string, string>
): Promise<WebPushResult> {
  if (!ensureConfigured()) return { ok: false, notConfigured: true };

  let subscription: webpush.PushSubscription;
  try {
    subscription = JSON.parse(subscriptionJson);
  } catch {
    return { ok: false, invalidSubscription: true };
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, channelId, data }),
      { urgency: channelId === "CRITICAL_ALERTS" || channelId === "FAMILY_SOS" ? "high" : "normal" }
    );
    return { ok: true };
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    const invalidSubscription = statusCode === 404 || statusCode === 410;
    return { ok: false, invalidSubscription };
  }
}
