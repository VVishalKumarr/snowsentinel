"use client";

// HazardAlertContext.tsx — the shared brain connecting the six new
// features to the existing risk model: it derives the 4-tier alert level
// from the scenario already selected via ScenarioContext, tracks a DEMO
// PREDICTION countdown, resolves the user's device location into a hazard
// zone, dedupes when a new alert banner should appear, and triggers voice
// alerts. Everything here reads from the EXISTING scenario/risk system —
// it does not introduce a second source of truth for hazard data.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useScenario } from "./ScenarioContext";
import { useLanguage } from "./i18n";
import { useAuth } from "./AuthContext";
import { severityKeyOf } from "./demoData";
import {
  alertLevelForRisk,
  ALERT_LEVEL_RANK,
  DEMO_HAZARD_TYPE_KEY,
  HAZARD_TYPE_LABEL_KEY,
  type AlertLevel,
  type HazardType,
} from "./alertLevels";
import { getCountdownDurationMs } from "./useCountdown";
import { classifyLocationZone, distanceToHazard, type LocationZone } from "./locationAlert";
import { speak, isSpeechSupported } from "./voiceAlert";
import { playAlertSound } from "./alertSound";
import type { HazardScenario } from "./types";
import type { TranslationKey } from "./i18n/en";

const VOICE_ALERTS_KEY = "snowsentinel:voiceAlerts";
const SOUND_ALERTS_KEY = "snowsentinel:emergencySound";
const HAZARD_POLL_MS = 15000;

export interface HazardBannerAlert {
  scenarioId: string;
  level: AlertLevel;
  hazardTypeKey: TranslationKey;
  isServerAlert?: boolean;
}

interface ServerHazardAlert {
  id: number;
  hazardType: HazardType;
  alertLevel: AlertLevel;
  regionId: string;
  countdownSeconds: number | null;
  crowdDensity: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | null;
  isDemo: boolean;
  createdAt: string;
}

interface HazardAlertState {
  scenario: HazardScenario;
  alertLevel: AlertLevel;
  hazardTypeKey: TranslationKey;
  countdownTargetMs: number | null;
  isServerDemoAlert: boolean;
  crowdDensityOverride: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | null;

  userLocation: { lat: number; lng: number } | null;
  locationPermission: "granted" | "denied" | "prompt" | "unsupported";
  locationZone: LocationZone | null;
  distanceKm: number | null;
  requestLocation: () => void;

  bannerAlert: HazardBannerAlert | null;
  dismissBannerAlert: () => void;

  voiceAlertsEnabled: boolean;
  setVoiceAlertsEnabled: (enabled: boolean) => void;
  voiceSupported: boolean;
  speakAlert: (level: AlertLevel) => Promise<boolean>;

  emergencySoundEnabled: boolean;
  setEmergencySoundEnabled: (enabled: boolean) => void;
  muteSound: () => void;
}

const HazardAlertContext = createContext<HazardAlertState | null>(null);

export function HazardAlertProvider({ children }: { children: ReactNode }) {
  const { scenario } = useScenario();
  const { t, language } = useLanguage();
  const { user, authedFetch } = useAuth();

  const scenarioAlertLevel = alertLevelForRisk(scenario.risk.riskLevel);

  const [scenarioCountdownTargetMs, setScenarioCountdownTargetMs] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<HazardAlertState["locationPermission"]>("prompt");
  const [bannerAlert, setBannerAlert] = useState<HazardBannerAlert | null>(null);
  const [voiceAlertsEnabled, setVoiceAlertsEnabledState] = useState(false);
  const [emergencySoundEnabled, setEmergencySoundEnabledState] = useState(true);
  const [serverAlert, setServerAlert] = useState<ServerHazardAlert | null>(null);

  const lastNotifiedScenarioRef = useRef<string | null>(null);
  const lastVoiceScenarioRef = useRef<string | null>(null);
  const lastServerAlertIdRef = useRef<number | null>(null);
  const stopSoundRef = useRef<() => void>(() => {});

  useEffect(() => {
    try {
      setVoiceAlertsEnabledState(window.localStorage.getItem(VOICE_ALERTS_KEY) === "1");
      const storedSound = window.localStorage.getItem(SOUND_ALERTS_KEY);
      if (storedSound !== null) setEmergencySoundEnabledState(storedSound === "1");
    } catch {
      // ignore
    }
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      navigator.permissions
        ?.query({ name: "geolocation" as PermissionName })
        .then((status) => {
          setLocationPermission(status.state as "granted" | "denied" | "prompt");
        })
        .catch(() => {});
    }
  }, []);

  const setVoiceAlertsEnabled = useCallback((enabled: boolean) => {
    setVoiceAlertsEnabledState(enabled);
    try {
      window.localStorage.setItem(VOICE_ALERTS_KEY, enabled ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const setEmergencySoundEnabled = useCallback((enabled: boolean) => {
    setEmergencySoundEnabledState(enabled);
    try {
      window.localStorage.setItem(SOUND_ALERTS_KEY, enabled ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const muteSound = useCallback(() => {
    stopSoundRef.current();
  }, []);

  // Poll for a real, backend-created hazard alert (from the Demo Hazard
  // Control Panel, or in principle a future real detection pipeline) for
  // the CURRENT region — this is what lets an alert triggered elsewhere
  // (another device, the demo panel) show up in an already-open tab
  // without a reload. Only active while logged in.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await authedFetch(`/api/hazard-alerts/latest?regionId=${encodeURIComponent(scenario.region.id)}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setServerAlert(data.alert ?? null);
      } catch {
        // offline/unreachable — keep whatever we already had
      }
    }
    poll();
    const interval = setInterval(poll, HAZARD_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, authedFetch, scenario.region.id]);

  // The active server alert (if any, for this region) is authoritative —
  // it represents a real backend event, not just the locally-selected demo
  // scenario. Falls back to the scenario-derived level otherwise.
  const alertLevel = serverAlert ? serverAlert.alertLevel : scenarioAlertLevel;
  const hazardTypeKey = serverAlert ? HAZARD_TYPE_LABEL_KEY[serverAlert.hazardType] : DEMO_HAZARD_TYPE_KEY;
  const isServerDemoAlert = !!serverAlert;
  const crowdDensityOverride = serverAlert?.crowdDensity ?? null;

  // Recompute the DEMO PREDICTION countdown target whenever the active
  // scenario changes — a fresh countdown for a fresh hazard state. A
  // server alert's own countdown (anchored to when it was actually
  // created) takes over below once one exists.
  useEffect(() => {
    const durationMs = getCountdownDurationMs(severityKeyOf(scenario.id));
    setScenarioCountdownTargetMs(durationMs != null ? Date.now() + durationMs : null);
  }, [scenario.id]);

  const countdownTargetMs = useMemo(() => {
    if (serverAlert?.countdownSeconds != null) {
      return new Date(serverAlert.createdAt).getTime() + serverAlert.countdownSeconds * 1000;
    }
    if (serverAlert) return null; // server alert exists but carries no countdown (e.g. LOW/MODERATE)
    return scenarioCountdownTargetMs;
  }, [serverAlert, scenarioCountdownTargetMs]);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationPermission("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationPermission("granted");
        if (user) {
          authedFetch("/api/user/location", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ regionId: scenario.region.id, lat: loc.lat, lng: loc.lng }),
          }).catch(() => {});
        }
      },
      () => {
        setLocationPermission("denied");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [user, authedFetch, scenario.region.id]);

  const distanceKm = userLocation ? distanceToHazard(scenario, userLocation) : null;
  const locationZone = distanceKm != null ? classifyLocationZone(distanceKm) : null;

  const speakAlert = useCallback(
    async (level: AlertLevel) => {
      const hazard = t(hazardTypeKey).toLowerCase();
      const text = level === "CRITICAL" ? t("voiceAlertCriticalMessage", { hazard }) : t("voiceAlertHighMessage", { hazard });
      return speak(text, language);
    },
    [t, language, hazardTypeKey]
  );

  // New-alert dedupe (scenario path): only surface a banner (and, for
  // CRITICAL, speak automatically) when the active hazard actually
  // changed — a different scenario id — and the level is at least
  // MODERATE. Re-selecting the exact same scenario again does not re-fire
  // it. Skipped entirely while a server alert is active for this region,
  // since that path has its own dedupe below and is authoritative.
  useEffect(() => {
    if (serverAlert) return;
    if (lastNotifiedScenarioRef.current === scenario.id) return;
    lastNotifiedScenarioRef.current = scenario.id;
    if (ALERT_LEVEL_RANK[scenarioAlertLevel] >= ALERT_LEVEL_RANK.MODERATE) {
      setBannerAlert({ scenarioId: scenario.id, level: scenarioAlertLevel, hazardTypeKey: DEMO_HAZARD_TYPE_KEY });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id, scenarioAlertLevel, serverAlert]);

  // New-alert dedupe (server path) — fires once per distinct hazard_alerts
  // row id, regardless of how many polls see it.
  useEffect(() => {
    if (!serverAlert) return;
    if (lastServerAlertIdRef.current === serverAlert.id) return;
    lastServerAlertIdRef.current = serverAlert.id;
    if (ALERT_LEVEL_RANK[serverAlert.alertLevel] >= ALERT_LEVEL_RANK.MODERATE) {
      setBannerAlert({
        scenarioId: `hazard-alert-${serverAlert.id}`,
        level: serverAlert.alertLevel,
        hazardTypeKey: HAZARD_TYPE_LABEL_KEY[serverAlert.hazardType],
        isServerAlert: true,
      });
    }
  }, [serverAlert]);

  useEffect(() => {
    if (!bannerAlert) return;
    if (ALERT_LEVEL_RANK[bannerAlert.level] < ALERT_LEVEL_RANK.HIGH) return;
    if (!emergencySoundEnabled) return;
    stopSoundRef.current = playAlertSound(bannerAlert.level === "CRITICAL" ? "CRITICAL" : "HIGH");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerAlert, emergencySoundEnabled]);

  useEffect(() => {
    if (!voiceAlertsEnabled) return;
    if (alertLevel !== "CRITICAL") return;
    const key = serverAlert ? `server-${serverAlert.id}` : scenario.id;
    if (lastVoiceScenarioRef.current === key) return;
    lastVoiceScenarioRef.current = key;
    speakAlert("CRITICAL");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id, alertLevel, voiceAlertsEnabled, serverAlert]);

  const dismissBannerAlert = useCallback(() => {
    setBannerAlert(null);
    stopSoundRef.current();
  }, []);

  const value = useMemo<HazardAlertState>(
    () => ({
      scenario,
      alertLevel,
      hazardTypeKey,
      countdownTargetMs,
      isServerDemoAlert,
      crowdDensityOverride,
      userLocation,
      locationPermission,
      locationZone,
      distanceKm,
      requestLocation,
      bannerAlert,
      dismissBannerAlert,
      voiceAlertsEnabled,
      setVoiceAlertsEnabled,
      voiceSupported: isSpeechSupported(),
      speakAlert,
      emergencySoundEnabled,
      setEmergencySoundEnabled,
      muteSound,
    }),
    [
      scenario,
      alertLevel,
      hazardTypeKey,
      countdownTargetMs,
      isServerDemoAlert,
      crowdDensityOverride,
      userLocation,
      locationPermission,
      locationZone,
      distanceKm,
      requestLocation,
      bannerAlert,
      dismissBannerAlert,
      voiceAlertsEnabled,
      setVoiceAlertsEnabled,
      speakAlert,
      emergencySoundEnabled,
      setEmergencySoundEnabled,
      muteSound,
    ]
  );

  return <HazardAlertContext.Provider value={value}>{children}</HazardAlertContext.Provider>;
}

export function useHazardAlert() {
  const ctx = useContext(HazardAlertContext);
  if (!ctx) throw new Error("useHazardAlert must be used within HazardAlertProvider");
  return ctx;
}
