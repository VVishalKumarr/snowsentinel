// nativeSms.ts — bridge to the Android-only SmsSender native plugin
// (android/app/.../SmsSenderPlugin.java). This sends a real SMS directly,
// without opening the Messages app or requiring a final tap there.
//
// This is deliberately Android-only. iOS does not allow any app, under any
// circumstance, to send SMS without the user manually tapping Send inside
// the native Messages UI — there is no workaround, so no iOS implementation
// exists here. On web and iOS, callers should fall back to an `sms:` link
// (see buildSmsComposeHref below) which opens the compose screen pre-filled
// and still requires one tap to actually send.

import { registerPlugin, Capacitor } from "@capacitor/core";

interface SmsSenderPlugin {
  sendSms(options: { number: string; message: string }): Promise<{ success: boolean }>;
}

const SmsSender = registerPlugin<SmsSenderPlugin>("SmsSender");

export function isNativeSmsAvailable(): boolean {
  try {
    return Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

/**
 * Sends a real SMS via Android's SmsManager. Triggers the OS SEND_SMS
 * runtime permission dialog on first use. Resolves false (never throws) if
 * unavailable, denied, or the send otherwise fails — callers should treat
 * that as "fall back to the compose-and-confirm link."
 */
export async function sendNativeSms(number: string, message: string): Promise<boolean> {
  if (!isNativeSmsAvailable()) return false;
  try {
    const result = await SmsSender.sendSms({ number, message });
    return !!result?.success;
  } catch {
    return false;
  }
}

/**
 * Cross-platform fallback: opens the native SMS compose screen with the
 * recipient(s) and message pre-filled. Requires one manual tap to send.
 * Works on iOS, Android (without the native plugin), and most mobile
 * browsers. Not meaningful on desktop (no SMS app to open).
 */
export function buildSmsComposeHref(numbers: string[], message: string): string {
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const recipients = numbers.join(",");
  const separator = isIOS ? "&" : "?";
  return `sms:${recipients}${separator}body=${encodeURIComponent(message)}`;
}

export function cleanPhoneNumber(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, "");
  return cleaned.length >= 7 ? cleaned : null;
}
