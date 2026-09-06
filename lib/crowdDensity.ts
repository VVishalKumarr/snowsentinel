// crowdDensity.ts — DEMO CROWD DATA. There is no real population/mobility
// feed wired up here; estimated-people figures are deterministically
// derived from each settlement's already-existing demo population and
// exposure level (see lib/demoData.ts), never randomized, and only ever
// shown aggregated per settlement/zone — never as individual locations.
// A real aggregation API (anonymized foot-traffic, census + tourism data,
// etc.) could replace getCrowdDensityForScenario's body without touching
// any caller, since the return shape would stay the same.

import type { HazardScenario, Settlement } from "./types";
import type { TranslationKey } from "./i18n/en";
import type { AlertLevel } from "./alertLevels";
import { ALERT_LEVEL_RANK, alertLevelForRisk } from "./alertLevels";

export type CrowdDensity = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

export interface CrowdDensityInfo {
  settlementId: string;
  settlementName: string;
  estimatedPeople: number;
  density: CrowdDensity;
  priority: AlertLevel;
}

export const CROWD_DENSITY_LABEL_KEY: Record<CrowdDensity, TranslationKey> = {
  LOW: "crowdDensityLow",
  MODERATE: "crowdDensityModerate",
  HIGH: "crowdDensityHigh",
  VERY_HIGH: "crowdDensityVeryHigh",
};

export const CROWD_DENSITY_EMOJI: Record<CrowdDensity, string> = {
  LOW: "🟢",
  MODERATE: "🟡",
  HIGH: "🟠",
  VERY_HIGH: "🔴",
};

// Demo-only: approximates seasonal visitor/trekker load on top of resident
// population, scaled by how exposed the settlement is to the hazard path.
const EXPOSURE_VISITOR_MULTIPLIER: Record<Settlement["exposure"], number> = {
  HIGH: 6,
  MODERATE: 3,
  LOW: 1.5,
};

function classifyDensity(estimatedPeople: number): CrowdDensity {
  if (estimatedPeople >= 2000) return "VERY_HIGH";
  if (estimatedPeople >= 800) return "HIGH";
  if (estimatedPeople >= 300) return "MODERATE";
  return "LOW";
}

const EXPOSURE_ALERT_LEVEL: Record<Settlement["exposure"], AlertLevel> = {
  HIGH: "CRITICAL",
  MODERATE: "HIGH",
  LOW: "MODERATE",
};

export function getCrowdDensityForScenario(scenario: HazardScenario): CrowdDensityInfo[] {
  const scenarioLevel = alertLevelForRisk(scenario.risk.riskLevel);
  return scenario.settlements.map((s) => {
    const estimatedPeople = Math.round(s.population * EXPOSURE_VISITOR_MULTIPLIER[s.exposure]);
    // Priority tracks whichever is more severe: this settlement's own
    // exposure, or the scenario's overall alert level — a CRITICAL
    // region-wide alert doesn't let a moderate-exposure settlement's
    // priority sit lower than the alert itself.
    const exposureLevel = EXPOSURE_ALERT_LEVEL[s.exposure];
    const priority = ALERT_LEVEL_RANK[scenarioLevel] > ALERT_LEVEL_RANK[exposureLevel] ? scenarioLevel : exposureLevel;
    return {
      settlementId: s.id,
      settlementName: s.name,
      estimatedPeople,
      density: classifyDensity(estimatedPeople),
      priority,
    };
  });
}

export function getTotalEstimatedPeople(scenario: HazardScenario): number {
  return getCrowdDensityForScenario(scenario).reduce((sum, c) => sum + c.estimatedPeople, 0);
}

export function getHighestCrowdDensity(scenario: HazardScenario): CrowdDensity {
  const infos = getCrowdDensityForScenario(scenario);
  const order: CrowdDensity[] = ["LOW", "MODERATE", "HIGH", "VERY_HIGH"];
  return infos.reduce<CrowdDensity>((worst, c) => (order.indexOf(c.density) > order.indexOf(worst) ? c.density : worst), "LOW");
}
