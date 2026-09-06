"use client";

// AppStateContext.tsx — local-first application state for the emergency
// layer: family safety, trusted contacts, SOS queue, alert acknowledgement,
// and connection status. Everything persists to localStorage so the app
// keeps working offline and survives a reload. There is no real backend —
// "sync" here means replaying queued local events once connectivity returns.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import type { FamilyMember, TrustedContact, SOSRequest, SafetyStatus } from "./emergencyTypes";
import { DEFAULT_FAMILY_MEMBERS } from "./emergencyData";
import { useLanguage } from "./i18n";

export type ConnectionState = "ONLINE" | "LIMITED" | "OFFLINE";

interface AppState {
  connection: ConnectionState;
  syncing: boolean;
  familyMembers: FamilyMember[];
  trustedContacts: TrustedContact[];
  sosQueue: SOSRequest[];
  acknowledgedAlertIds: string[];
  requestCheckIn: (memberId: string) => void;
  respondCheckIn: (memberId: string, status: Extract<SafetyStatus, "SAFE" | "NEEDS_HELP">) => void;
  addTrustedContact: (contact: Omit<TrustedContact, "id">) => void;
  removeTrustedContact: (id: string) => void;
  submitSOS: (recipientIds: string[], location: { lat: number; lng: number } | null) => SOSRequest;
  acknowledgeAlert: (id: string) => void;
}

const AppStateContext = createContext<AppState | null>(null);

const KEYS = {
  family: "snowsentinel:family",
  contacts: "snowsentinel:contacts",
  sos: "snowsentinel:sosQueue",
  ack: "snowsentinel:ackAlerts",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — app still works for this session
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [hydrated, setHydrated] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("ONLINE");
  const [syncing, setSyncing] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(DEFAULT_FAMILY_MEMBERS);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [sosQueue, setSosQueue] = useState<SOSRequest[]>([]);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);
  const prevConnection = useRef<ConnectionState>("ONLINE");

  useEffect(() => {
    setFamilyMembers(load(KEYS.family, DEFAULT_FAMILY_MEMBERS));
    setTrustedContacts(load(KEYS.contacts, []));
    setSosQueue(load(KEYS.sos, []));
    setAcknowledgedAlertIds(load(KEYS.ack, []));
    setConnection(navigator.onLine ? "ONLINE" : "OFFLINE");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(KEYS.family, familyMembers);
  }, [familyMembers, hydrated]);
  useEffect(() => {
    if (hydrated) save(KEYS.contacts, trustedContacts);
  }, [trustedContacts, hydrated]);
  useEffect(() => {
    if (hydrated) save(KEYS.sos, sosQueue);
  }, [sosQueue, hydrated]);
  useEffect(() => {
    if (hydrated) save(KEYS.ack, acknowledgedAlertIds);
  }, [acknowledgedAlertIds, hydrated]);

  // Browser online/offline events, plus a lightweight periodic ping to
  // approximate a "limited connection" state that a plain online/offline
  // event can't detect.
  useEffect(() => {
    function handleOnline() {
      setConnection("ONLINE");
    }
    function handleOffline() {
      setConnection("OFFLINE");
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(async () => {
      if (!navigator.onLine) {
        setConnection("OFFLINE");
        return;
      }
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch("/manifest.webmanifest", { cache: "no-store", signal: controller.signal });
        clearTimeout(timeout);
        setConnection("ONLINE");
      } catch {
        setConnection((prev) => (prev === "OFFLINE" ? "OFFLINE" : "LIMITED"));
      }
    }, 20000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  // When connection recovers, replay any queued SOS events.
  useEffect(() => {
    if (prevConnection.current !== "ONLINE" && connection === "ONLINE" && sosQueue.some((r) => r.status === "QUEUED")) {
      setSyncing(true);
      const t = setTimeout(() => {
        setSosQueue((prev) => prev.map((r) => (r.status === "QUEUED" ? { ...r, status: "SENT" } : r)));
        setSyncing(false);
      }, 1200);
      return () => clearTimeout(t);
    }
    prevConnection.current = connection;
  }, [connection, sosQueue]);

  const requestCheckIn = useCallback((memberId: string) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: "CHECK_IN_REQUESTED" } : m))
    );
  }, []);

  const respondCheckIn = useCallback(
    (memberId: string, status: Extract<SafetyStatus, "SAFE" | "NEEDS_HELP">) => {
      setFamilyMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status, lastCheckIn: new Date().toISOString() } : m))
      );
    },
    []
  );

  const addTrustedContact = useCallback((contact: Omit<TrustedContact, "id">) => {
    setTrustedContacts((prev) => [...prev, { ...contact, id: `tc-${Date.now()}` }]);
  }, []);

  const removeTrustedContact = useCallback((id: string) => {
    setTrustedContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const submitSOS = useCallback(
    (recipientIds: string[], location: { lat: number; lng: number } | null): SOSRequest => {
      const isOnline = navigator.onLine && connection !== "OFFLINE";
      const request: SOSRequest = {
        id: `sos-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: isOnline ? "SENT" : "QUEUED",
        recipientIds,
        location,
        message: buildSOSMessage(location, t),
      };
      setSosQueue((prev) => [request, ...prev]);
      return request;
    },
    [connection, t]
  );

  const acknowledgeAlert = useCallback((id: string) => {
    setAcknowledgedAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      connection,
      syncing,
      familyMembers,
      trustedContacts,
      sosQueue,
      acknowledgedAlertIds,
      requestCheckIn,
      respondCheckIn,
      addTrustedContact,
      removeTrustedContact,
      submitSOS,
      acknowledgeAlert,
    }),
    [
      connection,
      syncing,
      familyMembers,
      trustedContacts,
      sosQueue,
      acknowledgedAlertIds,
      requestCheckIn,
      respondCheckIn,
      addTrustedContact,
      removeTrustedContact,
      submitSOS,
      acknowledgeAlert,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

function buildSOSMessage(
  location: { lat: number; lng: number } | null,
  t: (key: import("./i18n/en").TranslationKey, vars?: Record<string, string | number>) => string
): string {
  const locationText = location
    ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    : t("sosMessageLocationUnavailable");
  return [
    t("sosMessageAlertShort"),
    "",
    t("sosMessageNeedHelp"),
    "",
    t("sosMessageLocationLabel"),
    locationText,
    "",
    t("sosMessageTimeLabel"),
    new Date().toLocaleString(),
    "",
    t("sosMessageFooterServices"),
  ].join("\n");
}
