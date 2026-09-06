// DEMO DATA — SnowSentinel prototype
//
// Everything in this file is synthetic demonstration data built for a hackathon
// prototype. Coordinates are loosely inspired by real Himalayan regions but
// settlement names, hazard paths, and risk figures are FICTIONAL and were not
// derived from real satellite feeds, weather records, or hazard agency data.
// Do not use for real-world decision-making. All three regions below are
// fully wired up with independent scenario data — none are placeholders.
//
// Region/settlement/infrastructure NAMES are treated as proper nouns and are
// not translated (consistent with place names generally). Everything else —
// descriptions, preparedness notes, risk factor labels, recommended actions,
// and generated explanations — is stored as a TranslationKey (see
// lib/i18n/en.ts) and translated at render time via useLanguage()'s t().

import type {
  RegionOption,
  HazardScenario,
  Settlement,
  Infrastructure,
  ImpactZonePolygon,
  RiskFactor,
} from "./types";
import type { TranslationKey } from "./i18n/en";
import { calculateRisk } from "./riskEngine";

export const REGIONS: (RegionOption & { available: boolean })[] = [
  {
    id: "khumbu",
    name: "Khumbu / Everest Region",
    shortName: "Khumbu / Everest",
    center: [27.93, 86.85],
    descriptionKey: "regionKhumbuDescription",
    available: true,
  },
  {
    id: "annapurna",
    name: "Annapurna Sanctuary",
    shortName: "Annapurna Sanctuary",
    center: [28.53, 83.88],
    descriptionKey: "regionAnnapurnaDescription",
    available: true,
  },
  {
    id: "langtang",
    name: "Langtang Valley",
    shortName: "Langtang Valley",
    center: [28.21, 85.55],
    descriptionKey: "regionLangtangDescription",
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
        preparednessKey: "settlementPreparednessHigh",
      },
      {
        id: "khumbu-s2",
        name: "Dombuk Cluster (Demo)",
        type: "settlement",
        position: [27.83, 86.77],
        population: 340,
        exposure: "MODERATE",
        distanceFromPathKm: 3.8,
        preparednessKey: "settlementPreparednessModerate",
      },
      {
        id: "khumbu-s3",
        name: "Sherpani Gateway (Demo)",
        type: "settlement",
        position: [27.8, 86.74],
        population: 480,
        exposure: "LOW",
        distanceFromPathKm: 7.5,
        preparednessKey: "settlementPreparednessLow",
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
      { id: "khumbu-z1", labelKey: "zoneLabelHigh", color: "#ef4444", positions: [[27.975, 86.915], [27.975, 86.885], [27.935, 86.855], [27.935, 86.885]] },
      { id: "khumbu-z2", labelKey: "zoneLabelMonitoring", color: "#f97316", positions: [[27.945, 86.885], [27.945, 86.855], [27.865, 86.795], [27.865, 86.825]] },
      { id: "khumbu-z3", labelKey: "zoneLabelLower", color: "#22c55e", positions: [[27.87, 86.825], [27.87, 86.76], [27.79, 86.73], [27.79, 86.81]] },
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
        preparednessKey: "settlementPreparednessHigh",
      },
      {
        id: "annapurna-s2",
        name: "Sinuwa Cluster (Demo)",
        type: "settlement",
        position: [28.47, 83.865],
        population: 300,
        exposure: "MODERATE",
        distanceFromPathKm: 4.0,
        preparednessKey: "settlementPreparednessModerate",
      },
      {
        id: "annapurna-s3",
        name: "Landruk Gateway (Demo)",
        type: "settlement",
        position: [28.42, 83.85],
        population: 420,
        exposure: "LOW",
        distanceFromPathKm: 8.0,
        preparednessKey: "settlementPreparednessLow",
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
      { id: "annapurna-z1", labelKey: "zoneLabelHigh", color: "#ef4444", positions: [[28.555, 83.895], [28.555, 83.875], [28.5, 83.86], [28.5, 83.885]] },
      { id: "annapurna-z2", labelKey: "zoneLabelMonitoring", color: "#f97316", positions: [[28.51, 83.885], [28.51, 83.86], [28.44, 83.845], [28.44, 83.868]] },
      { id: "annapurna-z3", labelKey: "zoneLabelLower", color: "#22c55e", positions: [[28.45, 83.868], [28.45, 83.83], [28.38, 83.81], [28.38, 83.85]] },
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
        preparednessKey: "settlementPreparednessHigh",
      },
      {
        id: "langtang-s2",
        name: "River Junction Cluster (Demo)",
        type: "settlement",
        position: [28.165, 85.535],
        population: 250,
        exposure: "MODERATE",
        distanceFromPathKm: 3.6,
        preparednessKey: "settlementPreparednessModerate",
      },
      {
        id: "langtang-s3",
        name: "Highland Gateway (Demo)",
        type: "settlement",
        position: [28.13, 85.522],
        population: 300,
        exposure: "LOW",
        distanceFromPathKm: 7.0,
        preparednessKey: "settlementPreparednessLow",
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
      { id: "langtang-z1", labelKey: "zoneLabelHigh", color: "#ef4444", positions: [[28.235, 85.56], [28.235, 85.54], [28.19, 85.525], [28.19, 85.545]] },
      { id: "langtang-z2", labelKey: "zoneLabelMonitoring", color: "#f97316", positions: [[28.195, 85.545], [28.195, 85.522], [28.135, 85.508], [28.135, 85.528]] },
      { id: "langtang-z3", labelKey: "zoneLabelLower", color: "#22c55e", positions: [[28.14, 85.528], [28.14, 85.495], [28.08, 85.478], [28.08, 85.51]] },
    ],
  },
};

const recommendedActionsBase: TranslationKey[] = [
  "actionContinueMonitoring",
  "actionVerifyConditions",
  "actionReviewInfrastructure",
  "actionPrepareComms",
  "actionIdentifySafeAreas",
];

type SeverityKey = "high-anomaly" | "stable" | "extreme";

interface SeverityTemplate {
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  environmentalChange: { snowIceChangePct: number; surfaceChangePct: number; deltaFromPrevious: number };
  timeline: { date: string; label: string; snowIceIndex: number; surfaceIndex: number }[];
  riskFactors: Pick<RiskFactor, "key" | "labelKey" | "score" | "descriptionKey">[];
  simulatedStats: { affectedAreaKm2: number; exposedSettlements: number; criticalInfrastructure: number };
  recommendedActionKeys: TranslationKey[];
  explanationKey: TranslationKey;
}

const SEVERITY_TEMPLATES: Record<SeverityKey, SeverityTemplate> = {
  "high-anomaly": {
    nameKey: "severityNameHighAnomaly",
    descriptionKey: "severityDescHighAnomaly",
    environmentalChange: { snowIceChangePct: 82, surfaceChangePct: 61, deltaFromPrevious: 18 },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 58, surfaceIndex: 45 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 65, surfaceIndex: 50 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 74, surfaceIndex: 56 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 82, surfaceIndex: 61 },
    ],
    riskFactors: [
      { key: "snowIce", labelKey: "riskFactorSnowIce", score: 82, descriptionKey: "riskFactorSnowIceDesc" },
      { key: "environmental", labelKey: "riskFactorEnvironmental", score: 66, descriptionKey: "riskFactorEnvironmentalDesc" },
      { key: "historical", labelKey: "riskFactorHistorical", score: 75, descriptionKey: "riskFactorHistoricalDesc" },
      { key: "terrain", labelKey: "riskFactorTerrain", score: 63, descriptionKey: "riskFactorTerrainDesc" },
    ],
    simulatedStats: { affectedAreaKm2: 8.4, exposedSettlements: 3, criticalInfrastructure: 5 },
    recommendedActionKeys: recommendedActionsBase,
    explanationKey: "explanationHighAnomaly",
  },
  stable: {
    nameKey: "severityNameStable",
    descriptionKey: "severityDescStable",
    environmentalChange: { snowIceChangePct: 20, surfaceChangePct: 17, deltaFromPrevious: 2 },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 18, surfaceIndex: 15 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 19, surfaceIndex: 16 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 17, surfaceIndex: 15 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 20, surfaceIndex: 17 },
    ],
    riskFactors: [
      { key: "snowIce", labelKey: "riskFactorSnowIce", score: 12, descriptionKey: "riskFactorSnowIceDesc" },
      { key: "environmental", labelKey: "riskFactorEnvironmental", score: 20, descriptionKey: "riskFactorEnvironmentalDesc" },
      { key: "historical", labelKey: "riskFactorHistorical", score: 25, descriptionKey: "riskFactorHistoricalDesc" },
      { key: "terrain", labelKey: "riskFactorTerrain", score: 30, descriptionKey: "riskFactorTerrainDesc" },
    ],
    simulatedStats: { affectedAreaKm2: 1.1, exposedSettlements: 0, criticalInfrastructure: 0 },
    recommendedActionKeys: ["actionContinueRoutine", "actionNoUnusualAction", "actionRevisitNextPass"],
    explanationKey: "explanationStable",
  },
  extreme: {
    nameKey: "severityNameExtreme",
    descriptionKey: "severityDescExtreme",
    environmentalChange: { snowIceChangePct: 95, surfaceChangePct: 88, deltaFromPrevious: 34 },
    timeline: [
      { date: "28 Aug", label: "28 AUG", snowIceIndex: 60, surfaceIndex: 50 },
      { date: "30 Aug", label: "30 AUG", snowIceIndex: 74, surfaceIndex: 62 },
      { date: "01 Sep", label: "01 SEP", snowIceIndex: 86, surfaceIndex: 75 },
      { date: "04 Sep", label: "04 SEP", snowIceIndex: 95, surfaceIndex: 88 },
    ],
    riskFactors: [
      { key: "snowIce", labelKey: "riskFactorSnowIce", score: 95, descriptionKey: "riskFactorSnowIceDesc" },
      { key: "environmental", labelKey: "riskFactorEnvironmental", score: 90, descriptionKey: "riskFactorEnvironmentalDesc" },
      { key: "historical", labelKey: "riskFactorHistorical", score: 80, descriptionKey: "riskFactorHistoricalDesc" },
      { key: "terrain", labelKey: "riskFactorTerrain", score: 70, descriptionKey: "riskFactorTerrainDesc" },
    ],
    simulatedStats: { affectedAreaKm2: 14.2, exposedSettlements: 3, criticalInfrastructure: 5 },
    recommendedActionKeys: [...recommendedActionsBase, "actionEscalateFindings"],
    explanationKey: "explanationExtreme",
  },
};

function buildScenariosForRegion(region: RegionOption): HazardScenario[] {
  const geo = GEO_BY_REGION[region.id];
  return (Object.keys(SEVERITY_TEMPLATES) as SeverityKey[]).map((severity) => {
    const t = SEVERITY_TEMPLATES[severity];
    return {
      id: `${region.id}-${severity}`,
      nameKey: t.nameKey,
      descriptionKey: t.descriptionKey,
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
      recommendedActionKeys: t.recommendedActionKeys,
      explanationKey: t.explanationKey,
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

export const HUMAN_VERIFICATION_STEPS: TranslationKey[] = [
  "verifyStep1",
  "verifyStep2",
  "verifyStep3",
  "verifyStep4",
  "verifyStep5",
];
