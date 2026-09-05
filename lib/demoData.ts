// DEMO DATA — SnowSentinel prototype
//
// Everything in this file is synthetic demonstration data built for a hackathon
// prototype. Coordinates are loosely inspired by real Himalayan regions but
// settlement names, hazard paths, and risk figures are FICTIONAL and were not
// derived from real satellite feeds, weather records, or hazard agency data.
// Do not use for real-world decision-making. All three regions below are
// fully wired up with independent scenario data — none are placeholders.

import type {
  RegionOption,
  HazardScenario,
  Settlement,
  Infrastructure,
  ImpactZonePolygon,
  RiskFactor,
} from "./types";
import { calculateRisk } from "./riskEngine";

export const REGIONS: (RegionOption & { available: boolean })[] = [
  {
    id: "khumbu",
    name: "Khumbu / Everest Region",
    shortName: "Khumbu / Everest",
    center: [27.93, 86.85],
    description: "Demo region loosely inspired by the Khumbu valley, Nepal.",
    available: true,
  },
  {
    id: "annapurna",
    name: "Annapurna Sanctuary",
    shortName: "Annapurna Sanctuary",
    center: [28.53, 83.88],
    description: "Demo region loosely inspired by the Annapurna Sanctuary, Nepal.",
    available: true,
  },
  {
    id: "langtang",
    name: "Langtang Valley",
    shortName: "Langtang Valley",
    center: [28.21, 85.55],
    description: "Demo region loosely inspired by the Langtang valley, Nepal.",
    available: true,
  },
];

interface RegionGeo {
  settlements: Settlement[];
  infrastructure: Infrastructure[];
  impactPath: [number, number][];
  impactZones: ImpactZonePolygon[];
}

const GEO_BY_REGION: Record<string, RegionGeo> = {
  khumbu: {
    settlements: [
      {
        id: "khumbu-s1",
        name: "Rilang Basti (Demo)",
        type: "settlement",
        position: [27.865, 86.8],
        population: 210,
        exposure: "HIGH",
        distanceFromPathKm: 1.2,
        preparedness: "Review evacuation routes; confirm with local authorities.",
      },
      {
        id: "khumbu-s2",
        name: "Dombuk Cluster (Demo)",
        type: "settlement",
        position: [27.83, 86.77],
        population: 340,
        exposure: "MODERATE",
        distanceFromPathKm: 3.8,
        preparedness: "Maintain monitoring; verify communication channels.",
      },
      {
        id: "khumbu-s3",
        name: "Sherpani Gateway (Demo)",
        type: "settlement",
        position: [27.8, 86.74],
        population: 480,
        exposure: "LOW",
        distanceFromPathKm: 7.5,
        preparedness: "Standard monitoring posture; no immediate action indicated.",
      },
    ],
    infrastructure: [
      { id: "khumbu-i1", name: "Ridge Footbridge (Demo)", type: "bridge", position: [27.878, 86.808] },
      { id: "khumbu-i2", name: "Suspension Bridge (Demo)", type: "bridge", position: [27.858, 86.795] },
      { id: "khumbu-i3", name: "Valley Highway (Demo)", type: "road", position: [27.845, 86.78] },
      { id: "khumbu-i4", name: "Community Medical Post (Demo)", type: "medical", position: [27.832, 86.771] },
      { id: "khumbu-i5", name: "Sherpani Primary School (Demo)", type: "school", position: [27.801, 86.741] },
    ],
    impactPath: [
      [27.97, 86.9],
      [27.94, 86.87],
      [27.91, 86.84],
      [27.88, 86.81],
      [27.85, 86.79],
    ],
    impactZones: [
      { id: "khumbu-z1", label: "HIGH IMPACT ZONE", color: "#ef4444", positions: [[27.975, 86.915], [27.975, 86.885], [27.935, 86.855], [27.935, 86.885]] },
      { id: "khumbu-z2", label: "MONITORING ZONE", color: "#f97316", positions: [[27.945, 86.885], [27.945, 86.855], [27.865, 86.795], [27.865, 86.825]] },
      { id: "khumbu-z3", label: "LOWER IMPACT ZONE", color: "#22c55e", positions: [[27.87, 86.825], [27.87, 86.76], [27.79, 86.73], [27.79, 86.81]] },
    ],
  },
  annapurna: {
    settlements: [
      {
        id: "annapurna-s1",
        name: "Chomrong Ridge (Demo)",
        type: "settlement",
        position: [28.505, 83.878],
        population: 260,
        exposure: "HIGH",
        distanceFromPathKm: 1.5,
        preparedness: "Review evacuation routes; confirm with local authorities.",
      },
      {
        id: "annapurna-s2",
        name: "Sinuwa Cluster (Demo)",
        type: "settlement",
        position: [28.47, 83.865],
        population: 300,
        exposure: "MODERATE",
        distanceFromPathKm: 4.0,
        preparedness: "Maintain monitoring; verify communication channels.",
      },
      {
        id: "annapurna-s3",
        name: "Landruk Gateway (Demo)",
        type: "settlement",
        position: [28.42, 83.85],
        population: 420,
        exposure: "LOW",
        distanceFromPathKm: 8.0,
        preparedness: "Standard monitoring posture; no immediate action indicated.",
      },
    ],
    infrastructure: [
      { id: "annapurna-i1", name: "Modi Khola Footbridge (Demo)", type: "bridge", position: [28.5, 83.875] },
      { id: "annapurna-i2", name: "Sanctuary Trail Bridge (Demo)", type: "bridge", position: [28.48, 83.868] },
      { id: "annapurna-i3", name: "Ring Road Link (Demo)", type: "road", position: [28.46, 83.86] },
      { id: "annapurna-i4", name: "Sinuwa Health Post (Demo)", type: "medical", position: [28.465, 83.862] },
      { id: "annapurna-i5", name: "Landruk Primary School (Demo)", type: "school", position: [28.415, 83.848] },
    ],
    impactPath: [
      [28.55, 83.885],
      [28.51, 83.876],
      [28.47, 83.865],
      [28.43, 83.855],
      [28.4, 83.848],
    ],
    impactZones: [
      { id: "annapurna-z1", label: "HIGH IMPACT ZONE", color: "#ef4444", positions: [[28.555, 83.895], [28.555, 83.875], [28.5, 83.86], [28.5, 83.885]] },
      { id: "annapurna-z2", label: "MONITORING ZONE", color: "#f97316", positions: [[28.51, 83.885], [28.51, 83.86], [28.44, 83.845], [28.44, 83.868]] },
      { id: "annapurna-z3", label: "LOWER IMPACT ZONE", color: "#22c55e", positions: [[28.45, 83.868], [28.45, 83.83], [28.38, 83.81], [28.38, 83.85]] },
    ],
  },
  langtang: {
    settlements: [
      {
        id: "langtang-s1",
        name: "Ridgeview Basti (Demo)",
        type: "settlement",
        position: [28.2, 85.548],
        population: 180,
        exposure: "HIGH",
        distanceFromPathKm: 1.3,
        preparedness: "Review evacuation routes; confirm with local authorities.",
      },
      {
        id: "langtang-s2",
        name: "River Junction Cluster (Demo)",
        type: "settlement",
        position: [28.165, 85.535],
        population: 250,
        exposure: "MODERATE",
        distanceFromPathKm: 3.6,
        preparedness: "Maintain monitoring; verify communication channels.",
      },
      {
        id: "langtang-s3",
        name: "Highland Gateway (Demo)",
        type: "settlement",
        position: [28.13, 85.522],
        population: 300,
        exposure: "LOW",
        distanceFromPathKm: 7.0,
        preparedness: "Standard monitoring posture; no immediate action indicated.",
      },
    ],
    infrastructure: [
      { id: "langtang-i1", name: "Langtang Khola Bridge (Demo)", type: "bridge", position: [28.19, 85.545] },
      { id: "langtang-i2", name: "Ridge Suspension Bridge (Demo)", type: "bridge", position: [28.17, 85.538] },
      { id: "langtang-i3", name: "Valley Access Road (Demo)", type: "road", position: [28.155, 85.53] },
      { id: "langtang-i4", name: "River Junction Health Post (Demo)", type: "medical", position: [28.16, 85.532] },
      { id: "langtang-i5", name: "Highland Primary School (Demo)", type: "school", position: [28.135, 85.523] },
    ],
    impactPath: [
      [28.23, 85.552],
      [28.19, 85.545],
      [28.16, 85.535],
      [28.13, 85.525],
      [28.1, 85.515],
    ],
    impactZones: [
      { id: "langtang-z1", label: "HIGH IMPACT ZONE", color: "#ef4444", positions: [[28.235, 85.56], [28.235, 85.54], [28.19, 85.525], [28.19, 85.545]] },
      { id: "langtang-z2", label: "MONITORING ZONE", color: "#f97316", positions: [[28.195, 85.545], [28.195, 85.522], [28.135, 85.508], [28.135, 85.528]] },
      { id: "langtang-z3", label: "LOWER IMPACT ZONE", color: "#22c55e", positions: [[28.14, 85.528], [28.14, 85.495], [28.08, 85.478], [28.08, 85.51]] },
    ],
  },
};

const recommendedActionsBase = [
  "Continue monitoring the region",
  "Verify conditions with official authorities",
  "Review vulnerable infrastructure",
  "Prepare communication channels",
  "Identify safe areas and evacuation routes",
];

type SeverityKey = "high-anomaly" | "stable" | "extreme";

interface SeverityTemplate {
  name: string;
  description: string;
  environmentalChange: { snowIceChangePct: number; surfaceChangePct: number; deltaFromPrevious: number };
  timeline: { date: string; label: string; snowIceIndex: number; surfaceIndex: number }[];
  riskFactors: Pick<RiskFactor, "key" | "label" | "score" | "description">[];
  simulatedStats: { affectedAreaKm2: number; exposedSettlements: number; criticalInfrastructure: number };
  recommendedActions: string[];
  explanationTemplate: (regionName: string) => string;
}

const SEVERITY_TEMPLATES: Record<SeverityKey, SeverityTemplate> = {
  "high-anomaly": {
    name: "High Mountain Snow/Ice Anomaly",
    description: "Significant observed change in snow/ice conditions.",
    environmentalChange: { snowIceChangePct: 82, surfaceChangePct: 61, deltaFromPrevious: 18 },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 58, surfaceIndex: 45 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 65, surfaceIndex: 50 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 74, surfaceIndex: 56 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 82, surfaceIndex: 61 },
    ],
    riskFactors: [
      { key: "snowIce", label: "Snow/Ice Change", score: 82, description: "Magnitude of observed snow/ice cover change vs. previous pass." },
      { key: "environmental", label: "Environmental Conditions", score: 66, description: "Temperature, precipitation, and wind proxies for the observation window." },
      { key: "historical", label: "Historical Hazard", score: 75, description: "Reference to demo historical hazard incidence for this zone." },
      { key: "terrain", label: "Terrain Exposure", score: 63, description: "Slope angle and runout exposure proxy for the source zone." },
    ],
    simulatedStats: { affectedAreaKm2: 8.4, exposedSettlements: 3, criticalInfrastructure: 5 },
    recommendedActions: recommendedActionsBase,
    explanationTemplate: (regionName) =>
      `Compared with the previous observation, the prototype detected a significant change in snow/ice conditions across the ${regionName} monitored zone. Combined with the selected environmental and historical indicators, this produces an ELEVATED experimental hazard-risk score in the simulated scenario.`,
  },
  stable: {
    name: "Stable Mountain Conditions",
    description: "Little change between observations.",
    environmentalChange: { snowIceChangePct: 20, surfaceChangePct: 17, deltaFromPrevious: 2 },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 18, surfaceIndex: 15 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 19, surfaceIndex: 16 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 17, surfaceIndex: 15 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 20, surfaceIndex: 17 },
    ],
    riskFactors: [
      { key: "snowIce", label: "Snow/Ice Change", score: 12, description: "Magnitude of observed snow/ice cover change vs. previous pass." },
      { key: "environmental", label: "Environmental Conditions", score: 20, description: "Temperature, precipitation, and wind proxies for the observation window." },
      { key: "historical", label: "Historical Hazard", score: 25, description: "Reference to demo historical hazard incidence for this zone." },
      { key: "terrain", label: "Terrain Exposure", score: 30, description: "Slope angle and runout exposure proxy for the source zone." },
    ],
    simulatedStats: { affectedAreaKm2: 1.1, exposedSettlements: 0, criticalInfrastructure: 0 },
    recommendedActions: [
      "Continue routine monitoring",
      "No unusual action indicated at this time",
      "Revisit at next scheduled observation pass",
    ],
    explanationTemplate: (regionName) =>
      `Compared with the previous observation, the prototype detected minimal change in snow/ice or surface conditions across the ${regionName} monitored zone. Environmental and historical indicators remain within the typical demo baseline range, producing a LOW experimental hazard-risk score in the simulated scenario.`,
  },
  extreme: {
    name: "Extreme Weather + Mountain Change",
    description: "Strong environmental anomaly combined with significant observed change.",
    environmentalChange: { snowIceChangePct: 95, surfaceChangePct: 88, deltaFromPrevious: 34 },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 60, surfaceIndex: 50 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 74, surfaceIndex: 62 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 86, surfaceIndex: 75 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 95, surfaceIndex: 88 },
    ],
    riskFactors: [
      { key: "snowIce", label: "Snow/Ice Change", score: 95, description: "Magnitude of observed snow/ice cover change vs. previous pass." },
      { key: "environmental", label: "Environmental Conditions", score: 90, description: "Temperature, precipitation, and wind proxies for the observation window." },
      { key: "historical", label: "Historical Hazard", score: 80, description: "Reference to demo historical hazard incidence for this zone." },
      { key: "terrain", label: "Terrain Exposure", score: 70, description: "Slope angle and runout exposure proxy for the source zone." },
    ],
    simulatedStats: { affectedAreaKm2: 14.2, exposedSettlements: 3, criticalInfrastructure: 5 },
    recommendedActions: [...recommendedActionsBase, "Escalate findings to regional monitoring authority (demo step)"],
    explanationTemplate: (regionName) =>
      `Compared with the previous observation, the prototype detected a severe change in snow/ice conditions combined with strong environmental anomaly indicators across the ${regionName} monitored zone. Combined with historical and terrain indicators, this produces a HIGH experimental hazard-risk score in the simulated scenario. This is a demonstration extreme case, not a live forecast.`,
  },
};

function buildScenariosForRegion(region: RegionOption): HazardScenario[] {
  const geo = GEO_BY_REGION[region.id];
  return (Object.keys(SEVERITY_TEMPLATES) as SeverityKey[]).map((severity) => {
    const t = SEVERITY_TEMPLATES[severity];
    return {
      id: `${region.id}-${severity}`,
      name: t.name,
      description: t.description,
      region,
      observationCurrent: { date: "04 Sep 2026", label: "Current Observation" },
      observationPrevious: { date: "28 Aug 2026", label: "Previous Observation" },
      environmentalChange: t.environmentalChange,
      timeline: t.timeline,
      risk: calculateRisk(t.riskFactors),
      impactPath: geo.impactPath,
      impactZones: geo.impactZones,
      settlements: geo.settlements,
      infrastructure: geo.infrastructure,
      simulatedStats: t.simulatedStats,
      recommendedActions: t.recommendedActions,
      explanation: t.explanationTemplate(region.shortName),
    };
  });
}

export const SCENARIOS: HazardScenario[] = REGIONS.flatMap((region) => buildScenariosForRegion(region));

export const DEFAULT_SCENARIO_ID = "khumbu-high-anomaly";

export function getScenario(id: string): HazardScenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

export function getScenariosForRegion(regionId: string): HazardScenario[] {
  return SCENARIOS.filter((s) => s.region.id === regionId);
}

export function severityKeyOf(scenarioId: string): SeverityKey {
  const parts = scenarioId.split("-");
  return parts.slice(1).join("-") as SeverityKey;
}

export const HUMAN_VERIFICATION_STEPS = [
  "Confirm current conditions with official hazard agencies.",
  "Check recent weather and precipitation.",
  "Verify satellite observations.",
  "Review local terrain and infrastructure.",
  "Do not treat this prototype as a standalone warning system.",
];
