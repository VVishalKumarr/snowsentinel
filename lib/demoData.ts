// DEMO DATA — SnowSentinel prototype
//
// Everything in this file is synthetic demonstration data built for a hackathon
// prototype. Coordinates are loosely inspired by the real Khumbu / Everest
// region but settlement names, hazard paths, and risk figures are FICTIONAL
// and were not derived from real satellite feeds, weather records, or hazard
// agency data. Do not use for real-world decision-making.

import type {
  RegionOption,
  HazardScenario,
  Settlement,
  Infrastructure,
  ImpactZonePolygon,
} from "./types";
import { calculateRisk } from "./riskEngine";

export const REGIONS: (RegionOption & { available: boolean })[] = [
  {
    id: "khumbu",
    name: "Khumbu / Everest Demo Region",
    shortName: "Khumbu / Everest",
    center: [27.93, 86.85],
    description:
      "Demo region loosely inspired by the Khumbu valley, Nepal. Used for prototype demonstration only.",
    available: true,
  },
  {
    id: "annapurna",
    name: "Annapurna Sanctuary (Coming Soon)",
    shortName: "Annapurna Sanctuary",
    center: [28.53, 83.88],
    description: "Not yet connected in this prototype.",
    available: false,
  },
  {
    id: "langtang",
    name: "Langtang Valley (Coming Soon)",
    shortName: "Langtang Valley",
    center: [28.21, 85.55],
    description: "Not yet connected in this prototype.",
    available: false,
  },
];

const settlementsKhumbu: Settlement[] = [
  {
    id: "s1",
    name: "Rilang Basti (Demo)",
    type: "settlement",
    position: [27.865, 86.8],
    population: 210,
    exposure: "HIGH",
    distanceFromPathKm: 1.2,
    preparedness: "Review evacuation routes; confirm with local authorities.",
  },
  {
    id: "s2",
    name: "Dombuk Cluster (Demo)",
    type: "settlement",
    position: [27.83, 86.77],
    population: 340,
    exposure: "MODERATE",
    distanceFromPathKm: 3.8,
    preparedness: "Maintain monitoring; verify communication channels.",
  },
  {
    id: "s3",
    name: "Sherpani Gateway (Demo)",
    type: "settlement",
    position: [27.8, 86.74],
    population: 480,
    exposure: "LOW",
    distanceFromPathKm: 7.5,
    preparedness: "Standard monitoring posture; no immediate action indicated.",
  },
];

const infrastructureKhumbu: Infrastructure[] = [
  { id: "i1", name: "Ridge Footbridge (Demo)", type: "bridge", position: [27.878, 86.808] },
  { id: "i2", name: "Suspension Bridge (Demo)", type: "bridge", position: [27.858, 86.795] },
  { id: "i3", name: "Valley Highway (Demo)", type: "road", position: [27.845, 86.78] },
  { id: "i4", name: "Community Medical Post (Demo)", type: "medical", position: [27.832, 86.771] },
  { id: "i5", name: "Sherpani Primary School (Demo)", type: "school", position: [27.801, 86.741] },
];

const impactPathKhumbu: [number, number][] = [
  [27.97, 86.9],
  [27.94, 86.87],
  [27.91, 86.84],
  [27.88, 86.81],
  [27.85, 86.79],
];

const impactZonesKhumbu: ImpactZonePolygon[] = [
  {
    id: "z1",
    label: "HIGH IMPACT ZONE",
    color: "#ef4444",
    positions: [
      [27.975, 86.915],
      [27.975, 86.885],
      [27.935, 86.855],
      [27.935, 86.885],
    ],
  },
  {
    id: "z2",
    label: "MONITORING ZONE",
    color: "#f97316",
    positions: [
      [27.945, 86.885],
      [27.945, 86.855],
      [27.865, 86.795],
      [27.865, 86.825],
    ],
  },
  {
    id: "z3",
    label: "LOWER IMPACT ZONE",
    color: "#22c55e",
    positions: [
      [27.87, 86.825],
      [27.87, 86.76],
      [27.79, 86.73],
      [27.79, 86.81],
    ],
  },
];

const recommendedActionsBase = [
  "Continue monitoring the region",
  "Verify conditions with official authorities",
  "Review vulnerable infrastructure",
  "Prepare communication channels",
  "Identify safe areas and evacuation routes",
];

export const SCENARIOS: HazardScenario[] = [
  {
    id: "high-anomaly",
    name: "High Mountain Snow/Ice Anomaly",
    description: "Significant observed change in snow/ice conditions.",
    region: REGIONS[0],
    observationCurrent: { date: "04 Sep 2026", label: "Current Observation" },
    observationPrevious: { date: "28 Aug 2026", label: "Previous Observation" },
    environmentalChange: {
      snowIceChangePct: 82,
      surfaceChangePct: 61,
      deltaFromPrevious: 18,
    },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 58, surfaceIndex: 45 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 65, surfaceIndex: 50 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 74, surfaceIndex: 56 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 82, surfaceIndex: 61 },
    ],
    risk: calculateRisk([
      { key: "snowIce", label: "Snow/Ice Change", score: 82, description: "Magnitude of observed snow/ice cover change vs. previous pass." },
      { key: "environmental", label: "Environmental Conditions", score: 66, description: "Temperature, precipitation, and wind proxies for the observation window." },
      { key: "historical", label: "Historical Hazard", score: 75, description: "Reference to demo historical hazard incidence for this zone." },
      { key: "terrain", label: "Terrain Exposure", score: 63, description: "Slope angle and runout exposure proxy for the source zone." },
    ]),
    impactPath: impactPathKhumbu,
    impactZones: impactZonesKhumbu,
    settlements: settlementsKhumbu,
    infrastructure: infrastructureKhumbu,
    simulatedStats: {
      affectedAreaKm2: 8.4,
      exposedSettlements: 3,
      criticalInfrastructure: 5,
    },
    recommendedActions: recommendedActionsBase,
    explanation:
      "Compared with the previous observation, the prototype detected a significant change in snow/ice conditions across the monitored zone. Combined with the selected environmental and historical indicators, this produces an ELEVATED experimental hazard-risk score in the simulated scenario.",
  },
  {
    id: "stable",
    name: "Stable Mountain Conditions",
    description: "Little change between observations.",
    region: REGIONS[0],
    observationCurrent: { date: "04 Sep 2026", label: "Current Observation" },
    observationPrevious: { date: "28 Aug 2026", label: "Previous Observation" },
    environmentalChange: {
      snowIceChangePct: 20,
      surfaceChangePct: 17,
      deltaFromPrevious: 2,
    },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 18, surfaceIndex: 15 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 19, surfaceIndex: 16 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 17, surfaceIndex: 15 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 20, surfaceIndex: 17 },
    ],
    risk: calculateRisk([
      { key: "snowIce", label: "Snow/Ice Change", score: 12, description: "Magnitude of observed snow/ice cover change vs. previous pass." },
      { key: "environmental", label: "Environmental Conditions", score: 20, description: "Temperature, precipitation, and wind proxies for the observation window." },
      { key: "historical", label: "Historical Hazard", score: 25, description: "Reference to demo historical hazard incidence for this zone." },
      { key: "terrain", label: "Terrain Exposure", score: 30, description: "Slope angle and runout exposure proxy for the source zone." },
    ]),
    impactPath: impactPathKhumbu,
    impactZones: impactZonesKhumbu,
    settlements: settlementsKhumbu,
    infrastructure: infrastructureKhumbu,
    simulatedStats: {
      affectedAreaKm2: 1.1,
      exposedSettlements: 0,
      criticalInfrastructure: 0,
    },
    recommendedActions: [
      "Continue routine monitoring",
      "No unusual action indicated at this time",
      "Revisit at next scheduled observation pass",
    ],
    explanation:
      "Compared with the previous observation, the prototype detected minimal change in snow/ice or surface conditions. Environmental and historical indicators remain within the typical demo baseline range, producing a LOW experimental hazard-risk score in the simulated scenario.",
  },
  {
    id: "extreme",
    name: "Extreme Weather + Mountain Change",
    description: "Strong environmental anomaly combined with significant observed change.",
    region: REGIONS[0],
    observationCurrent: { date: "04 Sep 2026", label: "Current Observation" },
    observationPrevious: { date: "28 Aug 2026", label: "Previous Observation" },
    environmentalChange: {
      snowIceChangePct: 95,
      surfaceChangePct: 88,
      deltaFromPrevious: 34,
    },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 60, surfaceIndex: 50 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 74, surfaceIndex: 62 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 86, surfaceIndex: 75 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 95, surfaceIndex: 88 },
    ],
    risk: calculateRisk([
      { key: "snowIce", label: "Snow/Ice Change", score: 95, description: "Magnitude of observed snow/ice cover change vs. previous pass." },
      { key: "environmental", label: "Environmental Conditions", score: 90, description: "Temperature, precipitation, and wind proxies for the observation window." },
      { key: "historical", label: "Historical Hazard", score: 80, description: "Reference to demo historical hazard incidence for this zone." },
      { key: "terrain", label: "Terrain Exposure", score: 70, description: "Slope angle and runout exposure proxy for the source zone." },
    ]),
    impactPath: impactPathKhumbu,
    impactZones: impactZonesKhumbu,
    settlements: settlementsKhumbu,
    infrastructure: infrastructureKhumbu,
    simulatedStats: {
      affectedAreaKm2: 14.2,
      exposedSettlements: 3,
      criticalInfrastructure: 5,
    },
    recommendedActions: [
      ...recommendedActionsBase,
      "Escalate findings to regional monitoring authority (demo step)",
    ],
    explanation:
      "Compared with the previous observation, the prototype detected a severe change in snow/ice conditions combined with strong environmental anomaly indicators. Combined with historical and terrain indicators, this produces a HIGH experimental hazard-risk score in the simulated scenario. This is a demonstration extreme case, not a live forecast.",
  },
];

export const DEFAULT_SCENARIO_ID = "high-anomaly";

export function getScenario(id: string): HazardScenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

export const HUMAN_VERIFICATION_STEPS = [
  "Confirm current conditions with official hazard agencies.",
  "Check recent weather and precipitation.",
  "Verify satellite observations.",
  "Review local terrain and infrastructure.",
  "Do not treat this prototype as a standalone warning system.",
];
