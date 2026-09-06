// fcm.ts — Firebase Cloud Messaging sender for the Android app. Optional,
// same pattern as lib/ai.ts's ANTHROPIC_API_KEY: with no
// FIREBASE_SERVICE_ACCOUNT configured, sendFcm no-ops instead of throwing,
// so the rest of the app (and the demo hazard flow) keeps working even
// before Firebase is set up — see the setup steps in the final report for
// exactly what to add.
//
// SECURITY: the service account JSON is read only from a server-side env
// var, never bundled into client code or committed to the repo. This
// module is only ever imported from API routes (server code).

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let app: App | null | undefined;

function getFirebaseApp(): App | null {
  if (app !== undefined) return app;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    app = null;
    return app;
  }
  try {
    const serviceAccount = JSON.parse(raw);
    app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
  } catch {
    app = null;
  }
  return app;
}

export function isFcmConfigured(): boolean {
  return getFirebaseApp() !== null;
}

export interface FcmResult {
  ok: boolean;
  invalidToken?: boolean;
  notConfigured?: boolean;
}

const HIGH_PRIORITY_CHANNELS = new Set(["CRITICAL_ALERTS", "HIGH_ALERTS", "FAMILY_SOS"]);

export async function sendFcm(
  token: string,
  title: string,
  body: string,
  channelId: string,
  data: Record<string, string>
): Promise<FcmResult> {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return { ok: false, notConfigured: true };

  try {
    await getMessaging(firebaseApp).send({
      token,
      notification: { title, body },
      android: {
        priority: HIGH_PRIORITY_CHANNELS.has(channelId) ? "high" : "normal",
        notification: { channelId, sound: "default" },
      },
      data,
    });
    return { ok: true };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code ?? "";
    const invalidToken =
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token" ||
      code === "messaging/invalid-argument";
    return { ok: false, invalidToken };
  }
}
