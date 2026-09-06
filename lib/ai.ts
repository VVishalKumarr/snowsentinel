// ai.ts — optional AI-assisted explanation layer.
//
// If ANTHROPIC_API_KEY is set, this calls the Claude API to turn structured
// hazard data into a plain-language explanation, in the caller's UI language.
// If no key is present (the default for most hackathon judges running this
// locally), it falls back to a deterministic, template-based explanation
// built from the same structured data and translated via the same i18n
// dictionaries the client uses — so the app works identically either way,
// in whichever of the four supported languages the user has selected.

import type { AnalyzeRequest, RiskAssessment } from "./types";
import { translate, isLanguageCode, type LanguageCode } from "./i18n/shared";
import type { TranslationKey } from "./i18n/en";

interface ExplainInput extends AnalyzeRequest {
  risk: RiskAssessment;
}

const ANTHROPIC_MODEL = "claude-sonnet-5";

const LANGUAGE_NAME: Record<LanguageCode, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  ne: "Nepali (नेपाली)",
  bo: "Tibetan (བོད་ཡིག)",
};

export async function generateExplanation(input: ExplainInput): Promise<{ text: string; source: "AI" | "DEMO" }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const lang: LanguageCode = isLanguageCode(input.language) ? input.language : "en";

  if (!apiKey) {
    return { text: buildDemoExplanation(input, lang), source: "DEMO" };
  }

  try {
    const prompt = buildPrompt(input, lang);
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
      return { text: buildDemoExplanation(input, lang), source: "DEMO" };
    }

    const data = await res.json();
    const text: string | undefined = data?.content?.[0]?.text;
    if (!text) {
      return { text: buildDemoExplanation(input, lang), source: "DEMO" };
    }
    return { text: text.trim(), source: "AI" };
  } catch {
    return { text: buildDemoExplanation(input, lang), source: "DEMO" };
  }
}

function buildPrompt(input: ExplainInput, lang: LanguageCode): string {
  return `You are an assistant embedded in "SnowSentinel", a HACKATHON PROTOTYPE for mountain hazard
monitoring. You are given structured, synthetic demo data (not real satellite feeds). Explain the
evidence in plain language for a non-technical reader.

STRICT RULES:
- Write the ENTIRE response in ${LANGUAGE_NAME[lang]}. Do not mix in English unless a proper noun requires it.
- This is a decision-support demo, NOT an operational avalanche prediction system.
- Never say an avalanche "will happen" or state a probability of an avalanche occurring.
- Use only terms like "experimental hazard-risk indicator", "potential hazard scenario", "satellite-observed anomaly" (translated naturally into the target language).
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
Risk factors: ${input.risk.factors.map((f) => `${translate(lang, f.labelKey)}=${f.score}`).join(", ")}

Write the explanation now, in ${LANGUAGE_NAME[lang]}.`;
}

function buildDemoExplanation(input: ExplainInput, lang: LanguageCode): string {
  const { risk } = input;
  const top = [...risk.factors].sort((a, b) => b.score - a.score)[0];
  return translate(lang, "aiDemoExplanation", {
    previousObs: input.previousObservation,
    magnitude: translate(lang, describeMagnitude(top.score)),
    factorLabel: translate(lang, top.labelKey).toLowerCase(),
    region: input.region,
    score: risk.riskScore,
    level: translate(lang, riskLevelKey(risk.riskLevel)),
  });
}

function describeMagnitude(score: number): TranslationKey {
  if (score >= 80) return "magnitudeSignificant";
  if (score >= 60) return "magnitudeNotable";
  if (score >= 35) return "magnitudeModerate";
  return "magnitudeMinimal";
}

function riskLevelKey(level: RiskAssessment["riskLevel"]): TranslationKey {
  if (level === "HIGH") return "riskLevelHigh";
  if (level === "ELEVATED") return "riskLevelElevated";
  if (level === "MEDIUM") return "riskLevelMedium";
  return "riskLevelLow";
}
