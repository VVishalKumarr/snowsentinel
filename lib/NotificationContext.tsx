"use client";

// NotificationContext.tsx — single shared source of truth for everything
// the notification bell, the in-app "family SOS" overlay, and the Family
// Safety page need: family members, pending requests, incoming check-in
// requests, incoming SOS alerts, the sender's own active SOS (with who has
// acknowledged), and SOS history. One polling loop feeds all three UIs
// instead of each fetching /api/family independently.
//
// "Live" here means lightweight polling (see POLL_MS below), not a
// websocket/SSE layer — deliberately, since a hackathon prototype's family
// group is small and a real-time transport would be infrastructure the
// project doesn't otherwise need. See lib/family.ts for how every query
// this pulls from is scoped server-side to the authenticated caller.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./i18n";
import type { FamilyMemberView } from "./family";

const POLL_MS = 20000;
const BROWSER_NOTIF_KEY = "snowsentinel:browserNotifications";

export interface PendingRequest {
  connectionId: number;
  fromUserId: number;
  fromName: string;
  fromUsername: string;
  relationship: string | null;
  createdAt: string;
}

export interface IncomingCheckIn {
  connectionId: number;
  fromUserId: number;
  fromName: string;
  requestedAt: string;
}

export type SosNotificationStatus = "UNREAD" | "READ" | "ACKNOWLEDGED";

export interface IncomingSosAlert {
  id: number;
  sosId: number;
  senderId: number;
  senderName: string;
  senderUsername: string;
  message: string;
  location: { lat: number; lng: number } | null;
  status: SosNotificationStatus;
  createdAt: string;
  readAt: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export interface SosRecipientStatusRow {
  userId: number;
  name: string;
  username: string;
  status: SosNotificationStatus;
  acknowledgedAt: string | null;
}

export interface ActiveSentSos {
  sosId: number;
  createdAt: string;
  resolvedAt: string | null;
  location: { lat: number; lng: number } | null;
  recipients: SosRecipientStatusRow[];
}

export interface SosHistoryItem {
  sosId: number;
  direction: "SENT" | "RECEIVED";
  counterpartName: string;
  counterpartUsername: string;
  createdAt: string;
  status: "SENT" | "ACKNOWLEDGED" | "RESOLVED";
  location: { lat: number; lng: number } | null;
}

interface NotificationState {
  loading: boolean;
  members: FamilyMemberView[];
  pendingRequests: PendingRequest[];
  incomingCheckIns: IncomingCheckIn[];
  incomingSosAlerts: IncomingSosAlert[];
  myActiveSentSos: ActiveSentSos[];
  sosHistory: SosHistoryItem[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markSosRead: (notificationId: number) => Promise<void>;
  acknowledgeSos: (notificationId: number) => Promise<void>;
  resolveSos: (sosId: number) => Promise<void>;
  activeSosAlert: IncomingSosAlert | null;
  dismissActiveSosAlert: () => void;
  browserNotificationsEnabled: boolean;
  setBrowserNotificationsEnabled: (enabled: boolean) => void;
  browserPermission: NotificationPermission | "unsupported";
}

const NotificationContext = createContext<NotificationState | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, authedFetch } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMemberView[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [incomingCheckIns, setIncomingCheckIns] = useState<IncomingCheckIn[]>([]);
  const [incomingSosAlerts, setIncomingSosAlerts] = useState<IncomingSosAlert[]>([]);
  const [myActiveSentSos, setMyActiveSentSos] = useState<ActiveSentSos[]>([]);
  const [sosHistory, setSosHistory] = useState<SosHistoryItem[]>([]);
  const [activeSosAlert, setActiveSosAlert] = useState<IncomingSosAlert | null>(null);

  const [browserNotificationsEnabled, setBrowserNotificationsEnabledState] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  const seenSosIds = useRef<Set<number> | null>(null); // null until first successful fetch

  useEffect(() => {
    try {
      setBrowserNotificationsEnabledState(window.localStorage.getItem(BROWSER_NOTIF_KEY) === "1");
    } catch {
      // ignore
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const setBrowserNotificationsEnabled = useCallback((enabled: boolean) => {
    setBrowserNotificationsEnabledState(enabled);
    try {
      window.localStorage.setItem(BROWSER_NOTIF_KEY, enabled ? "1" : "0");
    } catch {
      // ignore
    }
    // Only ever requested here, on an explicit user opt-in — never
    // auto-prompted, and never re-prompted once the user has answered.
    if (enabled && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => setBrowserPermission(perm));
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authedFetch("/api/family");
      if (!res.ok) return;
      const data = await res.json();
      const nextSos: IncomingSosAlert[] = data.incomingSosAlerts ?? [];

      setMembers(data.members ?? []);
      setPendingRequests(data.pendingRequests ?? []);
      setIncomingCheckIns(data.incomingCheckIns ?? []);
      setMyActiveSentSos(data.myActiveSentSos ?? []);
      setSosHistory(data.sosHistory ?? []);
      setIncomingSosAlerts(nextSos);

      if (seenSosIds.current === null) {
        // First load — establish the baseline without popping an alert for
        // anything that already existed before this session started.
        seenSosIds.current = new Set(nextSos.map((a) => a.id));
      } else {
        const brandNew = nextSos.find((a) => !seenSosIds.current!.has(a.id) && a.status !== "ACKNOWLEDGED");
        nextSos.forEach((a) => seenSosIds.current!.add(a.id));
        if (brandNew) {
          setActiveSosAlert(brandNew);
          if (
            browserNotificationsEnabled &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(t("browserNotifSosTitle"), {
                body: t("sosActivatedMessage", { name: brandNew.senderName }),
              });
            } catch {
              // ignore — some environments (e.g. embedded webviews) reject this
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authedFetch, browserNotificationsEnabled, t]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    refresh();
    const interval = setInterval(() => {
      if (typeof navigator === "undefined" || navigator.onLine) refresh();
    }, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markSosRead = useCallback(
    async (notificationId: number) => {
      setIncomingSosAlerts((prev) =>
        prev.map((a) => (a.id === notificationId && a.status === "UNREAD" ? { ...a, status: "READ" } : a))
      );
      await authedFetch("/api/sos/notifications/read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notificationId }),
      }).catch(() => {});
    },
    [authedFetch]
  );

  const acknowledgeSos = useCallback(
    async (notificationId: number) => {
      setIncomingSosAlerts((prev) =>
        prev.map((a) => (a.id === notificationId ? { ...a, status: "ACKNOWLEDGED" } : a))
      );
      setActiveSosAlert((prev) => (prev?.id === notificationId ? null : prev));
      await authedFetch("/api/sos/notifications/acknowledge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notificationId }),
      }).catch(() => {});
      refresh();
    },
    [authedFetch, refresh]
  );

  const resolveSos = useCallback(
    async (sosId: number) => {
      await authedFetch("/api/sos/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sosId }),
      }).catch(() => {});
      refresh();
    },
    [authedFetch, refresh]
  );

  const dismissActiveSosAlert = useCallback(() => setActiveSosAlert(null), []);

  const unreadCount = useMemo(
    () => incomingSosAlerts.filter((a) => a.status === "UNREAD").length + incomingCheckIns.length + pendingRequests.length,
    [incomingSosAlerts, incomingCheckIns, pendingRequests]
  );

  const value = useMemo<NotificationState>(
    () => ({
      loading,
      members,
      pendingRequests,
      incomingCheckIns,
      incomingSosAlerts,
      myActiveSentSos,
      sosHistory,
      unreadCount,
      refresh,
      markSosRead,
      acknowledgeSos,
      resolveSos,
      activeSosAlert,
      dismissActiveSosAlert,
      browserNotificationsEnabled,
      setBrowserNotificationsEnabled,
      browserPermission,
    }),
    [
      loading,
      members,
      pendingRequests,
      incomingCheckIns,
      incomingSosAlerts,
      myActiveSentSos,
      sosHistory,
      unreadCount,
      refresh,
      markSosRead,
      acknowledgeSos,
      resolveSos,
      activeSosAlert,
      dismissActiveSosAlert,
      browserNotificationsEnabled,
      setBrowserNotificationsEnabled,
      browserPermission,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
