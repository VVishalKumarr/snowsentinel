// pushRegistration.ts — client-side registration for REAL device push,
// covering both platforms this app ships on:
//   - Android (Capacitor): @capacitor/push-notifications wraps Firebase
//     Cloud Messaging. Requires google-services.json + a rebuilt APK
//     before it can actually register (see README/final report).
//   - Web: the standard Push API (PushManager + the service worker's
//     `push` event — see public/sw.js), using the VAPID key pair in env.
// Neither path uses polling/localStorage/setInterval for delivery — both
// hand off to the platform's own push transport, which is what lets a
// notification arrive while the app/tab is closed.

import { Capacitor } from "@capacitor/core";
import { PushNotifications, type Importance, type Visibility } from "@capacitor/push-notifications";

export type PushSupportState = "granted" | "denied" | "unsupported" | "prompt";

// ---------------------------------------------------------------------------
// Android native (FCM via Capacitor)
// ---------------------------------------------------------------------------
// Importing the official plugin object is safe even on web/iOS builds that
// never call these functions — Capacitor's web implementation of a plugin
// with no native counterpart configured just resolves as "unavailable" at
// call time rather than crashing at import time. Every function below is
// still gated behind isNativeAndroid() regardless.

export function isNativeAndroid(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

// Android notification channels — CRITICAL/HIGH/FAMILY_SOS use
// IMPORTANCE_HIGH (4) so they can heads-up + sound even when the phone is
// otherwise quiet; GENERAL uses IMPORTANCE_DEFAULT (3). Channel settings
// are fixed by Android once created — recreating with the same id is a
// no-op, which is why this is safe to call on every app start.
const IMPORTANCE_HIGH: Importance = 4;
const IMPORTANCE_DEFAULT: Importance = 3;
const VISIBILITY_PUBLIC: Visibility = 1;

export async function setupAndroidChannels(): Promise<void> {
  if (!isNativeAndroid()) return;
  const channels: Array<{ id: string; name: string; importance: Importance }> = [
    { id: "CRITICAL_ALERTS", name: "Critical Hazard Alerts", importance: IMPORTANCE_HIGH },
    { id: "HIGH_ALERTS", name: "High Hazard Alerts", importance: IMPORTANCE_HIGH },
    { id: "FAMILY_SOS", name: "Family SOS", importance: IMPORTANCE_HIGH },
    { id: "GENERAL_ALERTS", name: "General Notifications", importance: IMPORTANCE_DEFAULT },
  ];
  for (const ch of channels) {
    try {
      await PushNotifications.createChannel({
        ...ch,
        visibility: VISIBILITY_PUBLIC,
        sound: "default",
        vibration: true,
        lights: true,
      });
    } catch {
      // channel creation failing shouldn't block the rest of setup
    }
  }
}

export async function registerAndroidPush(
  onToken: (token: string) => void,
  onNotificationTap: (data: Record<string, string>) => void
): Promise<PushSupportState> {
  if (!isNativeAndroid()) return "unsupported";

  try {
    const current = await PushNotifications.checkPermissions();
    let receive = current.receive;
    if (receive === "prompt" || receive === "prompt-with-rationale") {
      const requested = await PushNotifications.requestPermissions();
      receive = requested.receive;
    }
    if (receive !== "granted") return "denied";

    await PushNotifications.addListener("registration", (token) => {
      if (token.value) onToken(token.value);
    });
    await PushNotifications.addListener("registrationError", () => {
      // no-op — token simply won't be registered; app keeps working
    });
    await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const data = action.notification?.data as Record<string, string> | undefined;
      if (data) onNotificationTap(data);
    });

    await PushNotifications.register();
    return "granted";
  } catch {
    return "denied";
  }
}

// ---------------------------------------------------------------------------
// Web Push
// ---------------------------------------------------------------------------

export function isWebPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function registerWebPush(): Promise<{ state: PushSupportState; subscriptionJson: string | null }> {
  if (!isWebPushSupported()) return { state: "unsupported", subscriptionJson: null };
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { state: "unsupported", subscriptionJson: null };

  try {
    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission !== "granted") return { state: "denied", subscriptionJson: null };

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      });
    }
    return { state: "granted", subscriptionJson: JSON.stringify(subscription) };
  } catch {
    return { state: "denied", subscriptionJson: null };
  }
}

export async function getWebPushPermissionState(): Promise<PushSupportState> {
  if (!isWebPushSupported() || typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "prompt";
}
