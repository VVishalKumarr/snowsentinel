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
import { severityKeyOf } from "./demoData";
import { alertLevelForRisk, ALERT_LEVEL_RANK, DEMO_HAZARD_TYPE_KEY, type AlertLevel } from "./alertLevels";
import { getCountdownDurationMs } from "./useCountdown";
import { classifyLocationZone, distanceToHazard, type LocationZone } from "./locationAlert";
import { speak, isSpeechSupported } from "./voiceAlert";
import type { HazardScenario } from "./types";

const VOICE_ALERTS_KEY = "snowsentinel:voiceAlerts";

export interface HazardBannerAlert {
  scenarioId: string;
  level: AlertLevel;
  hazardTypeKey: typeof DEMO_HAZARD_TYPE_KEY;
}

interface HazardAlertState {
  scenario: HazardScenario;
  alertLevel: AlertLevel;
  hazardTypeKey: typeof DEMO_HAZARD_TYPE_KEY;
  countdownTargetMs: number | null;

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
}

const HazardAlertContext = createContext<HazardAlertState | null>(null);

export function HazardAlertProvider({ children }: { children: ReactNode }) {
  const { scenario } = useScenario();
  const { t, language } = useLanguage();

  const alertLevel = alertLevelForRisk(scenario.risk.riskLevel);

  const [countdownTargetMs, setCountdownTargetMs] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<HazardAlertState["locationPermission"]>("prompt");
  const [bannerAlert, setBannerAlert] = useState<HazardBannerAlert | null>(null);
  const [voiceAlertsEnabled, setVoiceAlertsEnabledState] = useState(false);

  const lastNotifiedScenarioRef = useRef<string | null>(null);
  const lastVoiceScenarioRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      setVoiceAlertsEnabledState(window.localStorage.getItem(VOICE_ALERTS_KEY) === "1");
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

  // Recompute the DEMO PREDICTION countdown target whenever the active
  // scenario changes — a fresh countdown for a fresh hazard state.
  useEffect(() => {
    const durationMs = getCountdownDurationMs(severityKeyOf(scenario.id));
    setCountdownTargetMs(durationMs != null ? Date.now() + durationMs : null);
  }, [scenario.id]);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationPermission("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationPermission("granted");
      },
      () => {
        setLocationPermission("denied");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const distanceKm = userLocation ? distanceToHazard(scenario, userLocation) : null;
  const locationZone = distanceKm != null ? classifyLocationZone(distanceKm) : null;

  const speakAlert = useCallback(
    async (level: AlertLevel) => {
      const hazard = t(DEMO_HAZARD_TYPE_KEY).toLowerCase();
      const text = level === "CRITICAL" ? t("voiceAlertCriticalMessage", { hazard }) : t("voiceAlertHighMessage", { hazard });
      return speak(text, language);
    },
    [t, language]
  );

  // New-alert dedupe: only surface a banner (and, for CRITICAL, speak
  // automatically) when the active hazard actually changed — a different
  // scenario id — and the level is at least MODERATE. Re-selecting the
  // exact same scenario again does not re-fire it.
  useEffect(() => {
    if (lastNotifiedScenarioRef.current === scenario.id) return;
    lastNotifiedScenarioRef.current = scenario.id;
    if (ALERT_LEVEL_RANK[alertLevel] >= ALERT_LEVEL_RANK.MODERATE) {
      setBannerAlert({ scenarioId: scenario.id, level: alertLevel, hazardTypeKey: DEMO_HAZARD_TYPE_KEY });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id, alertLevel]);

  useEffect(() => {
    if (!voiceAlertsEnabled) return;
    if (alertLevel !== "CRITICAL") return;
    if (lastVoiceScenarioRef.current === scenario.id) return;
    lastVoiceScenarioRef.current = scenario.id;
    speakAlert("CRITICAL");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id, alertLevel, voiceAlertsEnabled]);

  const dismissBannerAlert = useCallback(() => setBannerAlert(null), []);

  const value = useMemo<HazardAlertState>(
    () => ({
      scenario,
      alertLevel,
      hazardTypeKey: DEMO_HAZARD_TYPE_KEY,
      countdownTargetMs,
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
    }),
    [
      scenario,
      alertLevel,
      countdownTargetMs,
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
    ]
  );

  return <HazardAlertContext.Provider value={value}>{children}</HazardAlertContext.Provider>;
}

export function useHazardAlert() {
  const ctx = useContext(HazardAlertContext);
  if (!ctx) throw new Error("useHazardAlert must be used within HazardAlertProvider");
  return ctx;
}
