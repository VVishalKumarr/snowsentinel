"use client";

// PushRegistrationContext.tsx — the single "Enable Emergency Notifications"
// control's brains. Detects platform (Android native vs. web), requests
// the right permission, registers with FCM or the browser's Push API (see
// lib/pushRegistration.ts), and sends the resulting token/subscription to
// the backend (/api/notifications/register-device) so lib/pushService.ts
// can actually reach this device later — including while the app is
// closed. Also owns notification-tap routing for the Android path (the
// web path's tap routing lives in the service worker itself, since that's
// what fires when no tab is open at all).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import {
  isNativeAndroid,
  isWebPushSupported,
  setupAndroidChannels,
  registerAndroidPush,
  registerWebPush,
  getWebPushPermissionState,
  type PushSupportState,
} from "./pushRegistration";

const PUSH_ENABLED_KEY = "snowsentinel:pushEnabled";

type PushPlatform = "android" | "web" | "unsupported";

interface PushRegistrationState {
  platform: PushPlatform;
  permission: PushSupportState;
  enabled: boolean;
  enablePush: () => Promise<void>;
}

const PushRegistrationContext = createContext<PushRegistrationState | null>(null);

export function PushRegistrationProvider({ children }: { children: ReactNode }) {
  const { user, authedFetch } = useAuth();
  const router = useRouter();

  const [permission, setPermission] = useState<PushSupportState>("prompt");
  const [enabled, setEnabledState] = useState(false);
  const autoRegisteredRef = useRef(false);

  const platform: PushPlatform = useMemo(() => {
    if (isNativeAndroid()) return "android";
    if (isWebPushSupported()) return "web";
    return "unsupported";
  }, []);

  useEffect(() => {
    try {
      setEnabledState(window.localStorage.getItem(PUSH_ENABLED_KEY) === "1");
    } catch {
      // ignore
    }
    if (platform === "web") getWebPushPermissionState().then(setPermission);
  }, [platform]);

  const handleNotificationTap = useCallback(
    (data: Record<string, string>) => {
      if (data.type === "hazard") router.push(`/dashboard?tab=impact&alertId=${encodeURIComponent(data.alertId ?? "")}`);
      else if (data.type === "sos") router.push(`/dashboard?tab=family&notificationId=${encodeURIComponent(data.notificationId ?? "")}`);
    },
    [router]
  );

  const registerDeviceToken = useCallback(
    (token: string, tokenPlatform: "android" | "web") => {
      authedFetch("/api/notifications/register-device", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, platform: tokenPlatform }),
      }).catch(() => {});
    },
    [authedFetch]
  );

  const enablePush = useCallback(async () => {
    if (!user) return;

    if (platform === "android") {
      await setupAndroidChannels();
      const state = await registerAndroidPush((token) => registerDeviceToken(token, "android"), handleNotificationTap);
      setPermission(state);
      if (state === "granted") {
        setEnabledState(true);
        try {
          window.localStorage.setItem(PUSH_ENABLED_KEY, "1");
        } catch {
          // ignore
        }
      }
      return;
    }

    if (platform === "web") {
      const { state, subscriptionJson } = await registerWebPush();
      setPermission(state);
      if (state === "granted" && subscriptionJson) {
        registerDeviceToken(subscriptionJson, "web");
        setEnabledState(true);
        try {
          window.localStorage.setItem(PUSH_ENABLED_KEY, "1");
        } catch {
          // ignore
        }
      }
    }
  }, [user, platform, registerDeviceToken, handleNotificationTap]);

  // Re-register on app start if the user previously enabled push — Android
  // needs a fresh register() call each cold start to keep the token alive;
  // re-subscribing on web is a cheap no-op if already subscribed. This is
  // also how a refreshed/rotated token gets sent to the backend again.
  useEffect(() => {
    if (!user || !enabled || autoRegisteredRef.current) return;
    autoRegisteredRef.current = true;
    enablePush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, enabled]);

  const value = useMemo<PushRegistrationState>(
    () => ({ platform, permission, enabled, enablePush }),
    [platform, permission, enabled, enablePush]
  );

  return <PushRegistrationContext.Provider value={value}>{children}</PushRegistrationContext.Provider>;
}

export function usePushRegistration() {
  const ctx = useContext(PushRegistrationContext);
  if (!ctx) throw new Error("usePushRegistration must be used within PushRegistrationProvider");
  return ctx;
}
