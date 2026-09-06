// safetyAssistant.ts — the AI Safety Assistant's rule-based knowledge base.
// This is the ALWAYS-AVAILABLE path (works fully offline, no network or API
// key needed) — see components/SafetyAssistant.tsx for where this is tried
// first, before an optional live-AI call for free-text questions this
// doesn't recognize. Deliberately keyword-matched rather than a black box:
// every answer traces back to a specific translation key, so it can never
// silently drift into claiming something the app doesn't actually know.

import type { TranslationKey } from "./i18n/en";
import { ALERT_LEVEL_LABEL_KEY, ALERT_LEVEL_MESSAGE_KEY, type AlertLevel } from "./alertLevels";
import { ZONE_LABEL_KEY, type LocationZone } from "./locationAlert";

export type AssistantAction = "FIND_SHELTER" | "VIEW_ROUTE" | "CONTACT_EMERGENCY" | "SEND_SOS";

export interface AssistantContext {
  alertLevel: AlertLevel;
  riskScore: number;
  hazardTypeKey: TranslationKey;
  countdownText: string;
  locationZone: LocationZone | null;
  nearestShelterKm: number | null;
  familySafeCount: number;
  familyTotalCount: number;
}

export interface AssistantAnswer {
  text: string;
  actions: AssistantAction[];
  matched: boolean;
}

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

interface Rule {
  test: (q: string) => boolean;
  build: (ctx: AssistantContext, t: Translate) => Omit<AssistantAnswer, "matched">;
}

const RULES: Rule[] = [
  // Specific patterns are checked before the generic "what should I do"
  // catch-all below, since a question like "what should I do if my family
  // member is missing" contains that generic phrase as a substring — the
  // more specific intent (missing person) must win, not the generic one.
  {
    test: (q) => /missing|can't find|cannot find|lost.*(family|member)/.test(q),
    build: (_ctx, t) => ({ text: t("kbMissingFamilyMemberGuidance"), actions: ["SEND_SOS"] }),
  },
  {
    test: (q) => /\bsos\b|send sos|how do i send/.test(q),
    build: (_ctx, t) => ({ text: t("kbSosGuidance"), actions: ["SEND_SOS"] }),
  },
  {
    test: (q) => /shelter/.test(q),
    build: (ctx, t) => ({
      text:
        ctx.nearestShelterKm != null
          ? t("aiAssistantShelterAnswerTemplate", { distance: ctx.nearestShelterKm })
          : t("aiAssistantFallbackUnknown"),
      actions: ["FIND_SHELTER"],
    }),
  },
  {
    test: (q) => /(am i|my).*(risk zone|in danger|safe)|risk zone/.test(q),
    build: (ctx, t) => ({
      text: ctx.locationZone
        ? t("aiAssistantZoneAnswerTemplate", { zone: t(ZONE_LABEL_KEY[ctx.locationZone]) })
        : t("aiAssistantNoLocationAnswer"),
      actions: ctx.locationZone && ctx.locationZone !== "SAFE" ? ["VIEW_ROUTE", "FIND_SHELTER"] : [],
    }),
  },
  {
    test: (q) => /red alert|critical.*mean|what does.*alert mean|explain.*alert/.test(q),
    build: (ctx, t) => ({
      text: `${t("kbRedAlertExplain")} ${ctx.alertLevel === "CRITICAL" || ctx.alertLevel === "HIGH" ? t(ALERT_LEVEL_MESSAGE_KEY[ctx.alertLevel] ?? "alertLowStatusDashboard") : t("alertLowStatusDashboard")}`,
      actions: ["VIEW_ROUTE"],
    }),
  },
  {
    test: (q) => /check my risk|current risk|risk score|my risk/.test(q),
    build: (ctx, t) => ({
      text: t("aiAssistantRiskExplainTemplate", {
        score: ctx.riskScore,
        level: t(ALERT_LEVEL_LABEL_KEY[ctx.alertLevel]),
        message: ctx.alertLevel === "LOW" ? t("alertLowStatusDashboard") : t(ALERT_LEVEL_MESSAGE_KEY[ctx.alertLevel] ?? "alertLowStatusDashboard"),
      }),
      actions: ["VIEW_ROUTE"],
    }),
  },
  {
    test: (q) => /avalanche/.test(q),
    build: (_ctx, t) => ({ text: t("kbAvalancheGuidance"), actions: [] }),
  },
  {
    test: (q) => /flood/.test(q),
    build: (_ctx, t) => ({ text: t("kbFloodGuidance"), actions: [] }),
  },
  {
    test: (q) => /landslide/.test(q),
    build: (_ctx, t) => ({ text: t("kbLandslideGuidance"), actions: [] }),
  },
  {
    test: (q) => /earthquake/.test(q),
    build: (_ctx, t) => ({ text: t("kbEarthquakeGuidance"), actions: [] }),
  },
  {
    test: (q) => /storm|severe weather|weather/.test(q),
    build: (_ctx, t) => ({ text: t("kbSevereWeatherGuidance"), actions: [] }),
  },
  {
    test: (q) => /evacuat/.test(q),
    build: (_ctx, t) => ({ text: t("kbEvacuationGuidance"), actions: ["VIEW_ROUTE", "FIND_SHELTER"] }),
  },
  {
    test: (q) => /injur|hurt|wound|first aid|bleeding/.test(q),
    build: (_ctx, t) => ({ text: t("kbFirstResponseGuidance"), actions: ["CONTACT_EMERGENCY"] }),
  },
  {
    test: (q) => /contact|emergency service|phone number|call.*(police|help|emergency)/.test(q),
    build: (_ctx, t) => ({ text: t("kbEmergencyContactGuidance"), actions: ["CONTACT_EMERGENCY"] }),
  },
  {
    test: (q) => /how much time|countdown|how long|arrival/.test(q),
    build: (ctx, t) => ({ text: t("aiAssistantCountdownAnswerTemplate", { countdown: ctx.countdownText }), actions: [] }),
  },
  // Generic catch-all — kept last so every more specific pattern above
  // gets first refusal, since this phrase can appear as a substring of a
  // much more specific question (see comment at the top of this array).
  {
    test: (q) => /what should i do|do now|what do i do/.test(q),
    build: (ctx, t) => ({
      text: t("aiAssistantWhatToDoTemplate", {
        level: t(ALERT_LEVEL_LABEL_KEY[ctx.alertLevel]),
        hazard: t(ctx.hazardTypeKey).toLowerCase(),
        countdown: ctx.countdownText,
      }),
      actions: ["FIND_SHELTER", "VIEW_ROUTE", "SEND_SOS"],
    }),
  },
];

export function answerLocally(question: string, ctx: AssistantContext, t: Translate): AssistantAnswer {
  const q = question.toLowerCase();
  for (const rule of RULES) {
    if (rule.test(q)) return { ...rule.build(ctx, t), matched: true };
  }
  return { text: t("aiAssistantFallbackUnknown"), actions: ["CONTACT_EMERGENCY"], matched: false };
}

export const QUICK_QUESTIONS: { labelKey: TranslationKey; question: string }[] = [
  { labelKey: "aiAssistantQuickWhatToDo", question: "What should I do now?" },
  { labelKey: "aiAssistantQuickNearestShelter", question: "Find nearest shelter" },
  { labelKey: "aiAssistantQuickExplainAlert", question: "Explain current alert" },
  { labelKey: "aiAssistantQuickCheckRisk", question: "Check my risk" },
  { labelKey: "aiAssistantQuickEmergencyHelp", question: "Emergency help" },
];
