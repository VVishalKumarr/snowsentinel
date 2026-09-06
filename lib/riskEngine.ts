// riskEngine.ts — transparent, prototype-only weighting of hazard factors into
// an experimental hazard-risk score. This is NOT a scientifically validated
// avalanche prediction model. Weights are illustrative for demonstration.

import type { RiskAssessment, RiskFactor, RiskLevel } from "./types";

export const RISK_WEIGHTS: Record<RiskFactor["key"], number> = {
  snowIce: 0.3,
  environmental: 0.25,
  historical: 0.25,
  terrain: 0.2,
};

// Translated at render time via t("riskWeightingNote") — see lib/i18n/en.ts.
export const WEIGHTING_NOTE_KEY = "riskWeightingNote" as const;

export function levelForScore(score: number): RiskLevel {
  if (score >= 80) return "HIGH";
  if (score >= 60) return "ELEVATED";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

export function calculateRisk(
  rawFactors: Pick<RiskFactor, "key" | "labelKey" | "score" | "descriptionKey">[]
): RiskAssessment {
  const factors: RiskFactor[] = rawFactors.map((f) => ({
    ...f,
    weight: RISK_WEIGHTS[f.key],
  }));

  const weightedSum = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const riskScore = Math.round(weightedSum);

  return {
    riskScore,
    riskLevel: levelForScore(riskScore),
    factors,
    weightingNote: WEIGHTING_NOTE_KEY,
  };
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, { text: string; bg: string; border: string; glow: string }> = {
  LOW: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", glow: "shadow-emerald-100" },
  MEDIUM: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", glow: "shadow-amber-100" },
  ELEVATED: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300", glow: "shadow-orange-100" },
  HIGH: { text: "text-red-700", bg: "bg-red-50", border: "border-red-300", glow: "shadow-red-100" },
};
