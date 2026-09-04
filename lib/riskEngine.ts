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

export const WEIGHTING_NOTE =
  "Prototype weighting — not scientifically validated. Weights: 30% observed change, 25% environmental conditions, 25% historical hazard, 20% terrain exposure.";

export function levelForScore(score: number): RiskLevel {
  if (score >= 80) return "HIGH";
  if (score >= 60) return "ELEVATED";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

export function calculateRisk(
  rawFactors: Pick<RiskFactor, "key" | "label" | "score" | "description">[]
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
    weightingNote: WEIGHTING_NOTE,
  };
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, { text: string; bg: string; border: string; glow: string }> = {
  LOW: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/40", glow: "shadow-emerald-500/20" },
  MEDIUM: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/40", glow: "shadow-amber-500/20" },
  ELEVATED: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/40", glow: "shadow-orange-500/20" },
  HIGH: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40", glow: "shadow-red-500/20" },
};
