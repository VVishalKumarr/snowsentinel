import { NextRequest, NextResponse } from "next/server";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/shared";

// Optional live-AI fallback for the Safety Assistant, used ONLY when the
// local rule-based knowledge base (lib/safetyAssistant.ts) doesn't match
// the question — see components/SafetyAssistant.tsx. Same optional-key
// pattern as lib/ai.ts: with no ANTHROPIC_API_KEY this route simply isn't
// called (the client falls back to the rule-based "I don't have a
// specific answer" response instead of hitting this endpoint).

const ANTHROPIC_MODEL = "claude-sonnet-5";

const LANGUAGE_NAME: Record<LanguageCode, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  ne: "Nepali (नेपाली)",
  bo: "Tibetan (བོད་ཡིག)",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI assistant not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const question = String(body.question ?? "").slice(0, 500);
  const language: LanguageCode = isLanguageCode(body.language) ? body.language : "en";
  const context = body.context ?? {};

  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const prompt = `You are the SnowSentinel AI Safety Assistant, embedded in a HACKATHON PROTOTYPE for mountain disaster preparedness. Answer the user's question using ONLY the context below.

STRICT RULES:
- Respond ENTIRELY in ${LANGUAGE_NAME[language]}.
- Never invent a real evacuation order, real casualty figures, or claim access to live official data you don't have.
- If asked about something outside this context (e.g. a real, live emergency), tell the user this is demo data and to contact official emergency authorities immediately.
- Keep the answer to 2-4 short sentences plus a numbered action list if relevant.
- Do not claim any of this is scientifically validated — it's an experimental prototype.

CURRENT CONTEXT (JSON): ${JSON.stringify(context)}

USER QUESTION: ${question}

Answer now, in ${LANGUAGE_NAME[language]}.`;

  try {
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
      return NextResponse.json({ error: "AI assistant unavailable" }, { status: 502 });
    }
    const data = await res.json();
    const text: string | undefined = data?.content?.[0]?.text;
    if (!text) return NextResponse.json({ error: "AI assistant unavailable" }, { status: 502 });
    return NextResponse.json({ answer: text.trim() });
  } catch {
    return NextResponse.json({ error: "AI assistant unavailable" }, { status: 502 });
  }
}
