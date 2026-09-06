// Shared type definitions for SnowSentinel prototype.
// All "risk" and "impact" values here are experimental / demo constructs — see lib/demoData.ts.

import type { TranslationKey } from "./i18n/en";

export type RiskLevel = "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";

export interface RegionOption {
  id: string;
  name: string;
  shortName: string;
  center: [number, number]; // [lat, lng]
  descriptionKey: TranslationKey;
}

export interface ObservationMeta {
  id: "current" | "previous";
  label: string;
  date: string; // display date
}

export interface EnvironmentalChange {
  snowIceChangePct: number; // 0-100, magnitude of observed snow/ice change
  surfaceChangePct: number; // 0-100, magnitude of observed surface change
  deltaFromPrevious: number; // signed percent change vs prior observation
}

export interface TimelinePoint {
  date: string;
  label: string;
  snowIceIndex: number; // 0-100
  surfaceIndex: number; // 0-100
}

export interface RiskFactor {
  key: "snowIce" | "environmental" | "historical" | "terrain";
  labelKey: TranslationKey;
  score: number; // 0-100
  weight: number; // 0-1
  descriptionKey: TranslationKey;
}

export interface RiskAssessment {
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  weightingNote: TranslationKey;
}

export interface Settlement {
  id: string;
  name: string;
  type: "settlement";
  position: [number, number];
  population: number;
  exposure: "HIGH" | "MODERATE" | "LOW";
  distanceFromPathKm: number;
  preparednessKey: TranslationKey;
}

export interface Infrastructure {
  id: string;
  name: string;
  type: "road" | "bridge" | "medical" | "school";
  position: [number, number];
}

export interface ImpactZonePolygon {
  id: string;
  labelKey: "zoneLabelHigh" | "zoneLabelMonitoring" | "zoneLabelLower";
  color: string;
  positions: [number, number][];
}

export interface HazardScenario {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  region: RegionOption;
  observationCurrent: { date: string; label: string };
  observationPrevious: { date: string; label: string };
  environmentalChange: EnvironmentalChange;
  timeline: TimelinePoint[];
  risk: RiskAssessment;
  impactPath: [number, number][];
  impactZones: ImpactZonePolygon[];
  settlements: Settlement[];
  infrastructure: Infrastructure[];
  simulatedStats: {
    affectedAreaKm2: number;
    exposedSettlements: number;
    criticalInfrastructure: number;
  };
  recommendedActionKeys: TranslationKey[];
  explanationKey: TranslationKey;
}

export interface AnalyzeRequest {
  region: string;
  currentObservation: string;
  previousObservation: string;
  environmentalData: Record<string, unknown>;
  historicalRisk: Record<string, unknown>;
  terrainData: Record<string, unknown>;
  language?: string;
}

export interface AnalyzeResponse {
  riskScore: number;
  riskLevel: RiskLevel;
  observations: string[];
  riskFactors: RiskFactor[];
  explanation: string; // already-translated prose, rendered as-is
  potentialImpact: {
    area: string;
    settlements: number;
    infrastructure: number;
  };
  recommendedActions: TranslationKey[];
  dataSource: "AI" | "DEMO";
}
