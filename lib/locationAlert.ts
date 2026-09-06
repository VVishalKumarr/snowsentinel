// locationAlert.ts — classifies the user's device location relative to the
// current demo scenario's hazard path. Uses real haversine distance against
// the scenario's own coordinates (lib/demoData.ts) — the only "invented"
// part is the demo hazard coordinates themselves, which are already
// labeled DEMO throughout the app. If location permission is denied, every
// caller must treat `zone` as unavailable rather than guessing one.

import type { HazardScenario } from "./types";
import type { TranslationKey } from "./i18n/en";

export type LocationZone = "SAFE" | "NEAR_RISK" | "HIGH_RISK" | "CRITICAL";

export const ZONE_LABEL_KEY: Record<LocationZone, TranslationKey> = {
  SAFE: "zoneSafe",
  NEAR_RISK: "zoneNearRisk",
  HIGH_RISK: "zoneHighRisk",
  CRITICAL: "zoneCritical",
};

export const ZONE_EMOJI: Record<LocationZone, string> = {
  SAFE: "🟢",
  NEAR_RISK: "🟡",
  HIGH_RISK: "🟠",
  CRITICAL: "🔴",
};

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Demo thresholds — not derived from any real avalanche runout model.
const CRITICAL_KM = 2;
const HIGH_RISK_KM = 5;
const NEAR_RISK_KM = 10;

export function classifyLocationZone(distanceKm: number): LocationZone {
  if (distanceKm <= CRITICAL_KM) return "CRITICAL";
  if (distanceKm <= HIGH_RISK_KM) return "HIGH_RISK";
  if (distanceKm <= NEAR_RISK_KM) return "NEAR_RISK";
  return "SAFE";
}

export function distanceToHazard(scenario: HazardScenario, userLocation: { lat: number; lng: number }): number {
  const source = scenario.impactPath[0];
  return haversineDistanceKm(userLocation, { lat: source[0], lng: source[1] });
}
