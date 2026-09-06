// alertLevels.ts — maps the existing experimental RiskLevel ("LOW" |
// "MEDIUM" | "ELEVATED" | "HIGH") onto the 4-tier alert vocabulary
// (LOW/MODERATE/HIGH/CRITICAL) used by notifications, the risk countdown,
// location alerts, voice alerts, and the AI assistant — one derived scale
// instead of a second, competing "risk level" concept.

import type { RiskLevel } from "./types";
import type { TranslationKey } from "./i18n/en";

export type AlertLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export function alertLevelForRisk(riskLevel: RiskLevel): AlertLevel {
  switch (riskLevel) {
    case "LOW":
      return "LOW";
    case "MEDIUM":
      return "MODERATE";
    case "ELEVATED":
      return "HIGH";
    case "HIGH":
      return "CRITICAL";
  }
}

// Ordinal for comparisons ("did the level increase?").
export const ALERT_LEVEL_RANK: Record<AlertLevel, number> = {
  LOW: 0,
  MODERATE: 1,
  HIGH: 2,
  CRITICAL: 3,
};

export const ALERT_LEVEL_LABEL_KEY: Record<AlertLevel, TranslationKey> = {
  LOW: "alertLevelLow",
  MODERATE: "alertLevelModerate",
  HIGH: "alertLevelHigh",
  CRITICAL: "alertLevelCritical",
};

export const ALERT_LEVEL_MESSAGE_KEY: Partial<Record<AlertLevel, TranslationKey>> = {
  MODERATE: "alertModerateMessage",
  HIGH: "alertHighMessage",
  CRITICAL: "alertCriticalMessage",
};

export const ALERT_LEVEL_EMOJI: Record<AlertLevel, string> = {
  LOW: "🟢",
  MODERATE: "🟡",
  HIGH: "🟠",
  CRITICAL: "🔴",
};

export const ALERT_LEVEL_COLORS: Record<AlertLevel, { text: string; bg: string; border: string }> = {
  LOW: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
  MODERATE: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
  HIGH: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300" },
  CRITICAL: { text: "text-red-700", bg: "bg-red-50", border: "border-red-300" },
};

// This prototype's demo scenarios (lib/demoData.ts) are all framed around
// a snow/ice (avalanche-style) anomaly, so the scenario-derived alert
// (HazardAlertContext) uses this constant. The Demo Hazard Control Panel,
// by contrast, lets the presenter pick any of the types below — that's a
// separate, explicitly-labeled simulated event, not a reclassification of
// the underlying satellite-style demo scenario.
export const DEMO_HAZARD_TYPE_KEY: TranslationKey = "hazardTypeAvalanche";

export type HazardType = "AVALANCHE" | "FLOOD" | "LANDSLIDE" | "EARTHQUAKE" | "SEVERE_WEATHER";

export const HAZARD_TYPE_LABEL_KEY: Record<HazardType, TranslationKey> = {
  AVALANCHE: "hazardTypeAvalanche",
  FLOOD: "hazardTypeFlood",
  LANDSLIDE: "hazardTypeLandslide",
  EARTHQUAKE: "hazardTypeEarthquake",
  SEVERE_WEATHER: "hazardTypeSevereWeather",
};

export const HAZARD_TYPES: HazardType[] = ["AVALANCHE", "FLOOD", "LANDSLIDE", "EARTHQUAKE", "SEVERE_WEATHER"];
export const ALERT_LEVELS: AlertLevel[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];
