import { NextRequest, NextResponse } from "next/server";
import { calculateRisk } from "@/lib/riskEngine";
import { generateExplanation } from "@/lib/ai";
import { getScenario, HUMAN_VERIFICATION_STEPS } from "@/lib/demoData";
import type { AnalyzeRequest, AnalyzeResponse, RiskFactor } from "@/lib/types";

export async function POST(req: NextRequest) {
  let body: Partial<AnalyzeRequest> & { scenarioId?: string };

  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const scenario = getScenario(body.scenarioId ?? "high-anomaly");

  const rawFactors: Pick<RiskFactor, "key" | "label" | "score" | "description">[] =
    scenario.risk.factors.map((f) => ({
      key: f.key,
      label: f.label,
      score: f.score,
      description: f.description,
    }));

  const risk = calculateRisk(rawFactors);

  const { text: explanation, source } = await generateExplanation({
    region: body.region ?? scenario.region.name,
    currentObservation: body.currentObservation ?? scenario.observationCurrent.date,
    previousObservation: body.previousObservation ?? scenario.observationPrevious.date,
    environmentalData: body.environmentalData ?? { snowIceChangePct: scenario.environmentalChange.snowIceChangePct },
    historicalRisk: body.historicalRisk ?? {},
    terrainData: body.terrainData ?? {},
    risk,
  });

  const response: AnalyzeResponse = {
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    observations: [
      `Snow/Ice change: ${scenario.environmentalChange.snowIceChangePct}%`,
      `Surface change: ${scenario.environmentalChange.surfaceChangePct}%`,
      `Change vs. previous observation: +${scenario.environmentalChange.deltaFromPrevious}%`,
    ],
    riskFactors: risk.factors,
    explanation,
    potentialImpact: {
      area: `${scenario.simulatedStats.affectedAreaKm2} km²`,
      settlements: scenario.simulatedStats.exposedSettlements,
      infrastructure: scenario.simulatedStats.criticalInfrastructure,
    },
    recommendedActions: scenario.recommendedActions,
    dataSource: source,
  };

  return NextResponse.json({
    ...response,
    humanVerificationSteps: HUMAN_VERIFICATION_STEPS,
    disclaimer:
      "This prototype is not an operational avalanche prediction system. Risk assessments and impact zones are experimental simulations intended for demonstration and preparedness research.",
  });
}
