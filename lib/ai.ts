// ai.ts — optional AI-assisted explanation layer.
//
// If ANTHROPIC_API_KEY is set, this calls the Claude API to turn structured
// hazard data into a plain-language explanation. If no key is present (the
// default for most hackathon judges running this locally), it falls back to
// a deterministic, template-based explanation built from the same structured
// data — so the app works identically either way.

import type { AnalyzeRequest, RiskAssessment } from "./types";

interface ExplainInput extends AnalyzeRequest {
  risk: RiskAssessment;
}

const ANTHROPIC_MODEL = "claude-sonnet-5";

export async function generateExplanation(input: ExplainInput): Promise<{ text: string; source: "AI" | "DEMO" }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { text: buildDemoExplanation(input), source: "DEMO" };
  }

  try {
    const prompt = buildPrompt(input);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return { text: buildDemoExplanation(input), source: "DEMO" };
    }

    const data = await res.json();
    const text: string | undefined = data?.content?.[0]?.text;
    if (!text) {
      return { text: buildDemoExplanation(input), source: "DEMO" };
    }
    return { text: text.trim(), source: "AI" };
  } catch {
    return { text: buildDemoExplanation(input), source: "DEMO" };
  }
}

function buildPrompt(input: ExplainInput): string {
  return `You are an assistant embedded in "SnowSentinel", a HACKATHON PROTOTYPE for mountain hazard
monitoring. You are given structured, synthetic demo data (not real satellite feeds). Explain the
evidence in plain language for a non-technical reader.

STRICT RULES:
- This is a decision-support demo, NOT an operational avalanche prediction system.
- Never say an avalanche "will happen" or state a probability of an avalanche occurring.
- Use only terms like "experimental hazard-risk indicator", "potential hazard scenario", "satellite-observed anomaly".
- Explain the EVIDENCE (what changed, and how the score was derived). Do not predict whether a disaster will occur.
- Keep it to 3-5 sentences.

DATA:
Region: ${input.region}
Current observation: ${input.currentObservation}
Previous observation: ${input.previousObservation}
Environmental data: ${JSON.stringify(input.environmentalData)}
Historical risk reference: ${JSON.stringify(input.historicalRisk)}
Terrain data: ${JSON.stringify(input.terrainData)}
Computed experimental risk score: ${input.risk.riskScore}/100 (${input.risk.riskLevel})
Risk factors: ${input.risk.factors.map((f) => `${f.label}=${f.score}`).join(", ")}

Write the explanation now.`;
}

function buildDemoExplanation(input: ExplainInput): string {
  const { risk } = input;
  const top = [...risk.factors].sort((a, b) => b.score - a.score)[0];
  return `Compared with the previous observation (${input.previousObservation}), the prototype detected a ${describeMagnitude(
    top.score
  )} change in ${top.label.toLowerCase()} across the ${input.region} demo zone. Combined with the other selected environmental and historical indicators, this produces an experimental hazard-risk score of ${risk.riskScore}/100, classified as ${risk.riskLevel} in this simulated scenario. This score reflects the pattern of observed change, not a forecast of a specific event. Local terrain and infrastructure exposure should be verified independently before any response action is taken.`;
}

function describeMagnitude(score: number): string {
  if (score >= 80) return "significant";
  if (score >= 60) return "notable";
  if (score >= 35) return "moderate";
  return "minimal";
}
