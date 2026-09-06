"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, X, Send, Navigation, Home, PhoneCall, Siren } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useAppState } from "@/lib/AppStateContext";
import { useScenario } from "@/lib/ScenarioContext";
import { useHazardAlert } from "@/lib/HazardAlertContext";
import { useLanguage } from "@/lib/i18n";
import { useCountdown, formatCountdown } from "@/lib/useCountdown";
import { getShelters } from "@/lib/emergencyData";
import { answerLocally, QUICK_QUESTIONS, type AssistantAction, type AssistantContext } from "@/lib/safetyAssistant";

interface Message {
  role: "user" | "assistant";
  text: string;
  actions?: AssistantAction[];
  offline?: boolean;
}

const ACTION_META: Record<AssistantAction, { icon: typeof Navigation; tab?: string; labelKey: "aiAssistantButtonFindShelter" | "aiAssistantButtonViewRoute" | "aiAssistantButtonContactEmergency" | "aiAssistantButtonSendSos" }> = {
  FIND_SHELTER: { icon: Home, tab: "shelters", labelKey: "aiAssistantButtonFindShelter" },
  VIEW_ROUTE: { icon: Navigation, tab: "impact", labelKey: "aiAssistantButtonViewRoute" },
  CONTACT_EMERGENCY: { icon: PhoneCall, tab: "emergency", labelKey: "aiAssistantButtonContactEmergency" },
  SEND_SOS: { icon: Siren, tab: "emergency", labelKey: "aiAssistantButtonSendSos" },
};

export default function SafetyAssistant() {
  const { user } = useAuth();
  const { familyMembers, connection } = useAppState();
  const { scenario } = useScenario();
  const { alertLevel, hazardTypeKey, countdownTargetMs, locationZone } = useHazardAlert();
  const { remainingMs, reached } = useCountdown(countdownTargetMs);
  const { t, language } = useLanguage();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const isOffline = connection === "OFFLINE";
  const countdownText = countdownTargetMs == null ? t("arrivalTimeUnavailable") : reached ? t("hazardArrivalWindowReached") : remainingMs != null ? t("estimatedArrivalIn", { time: formatCountdown(remainingMs) }) : t("arrivalTimeUnavailable");

  const nearestShelterKm = getShelters(scenario.region.id).reduce<number | null>(
    (min, s) => (min == null || s.distanceKm < min ? s.distanceKm : min),
    null
  );

  const buildContext = (): AssistantContext => ({
    alertLevel,
    riskScore: scenario.risk.riskScore,
    hazardTypeKey,
    countdownText,
    locationZone,
    nearestShelterKm,
    familySafeCount: familyMembers.filter((m) => m.status === "SAFE").length,
    familyTotalCount: familyMembers.length,
  });

  const handleAction = (action: AssistantAction) => {
    const meta = ACTION_META[action];
    setOpen(false);
    if (meta.tab) router.push(`/dashboard?tab=${meta.tab}`);
  };

  const send = async (question: string, displayText?: string) => {
    if (!question.trim() || sending) return;
    setMessages((prev) => [...prev, { role: "user", text: displayText ?? question }]);
    setInput("");
    setSending(true);

    const local = answerLocally(question, buildContext(), t);

    if (local.matched || isOffline) {
      setMessages((prev) => [...prev, { role: "assistant", text: local.text, actions: local.actions, offline: isOffline }]);
      setSending(false);
      return;
    }

    // No keyword match and we're online — try the optional live-AI route.
    // If it's not configured or fails, fall back to the same honest
    // "I don't have a specific answer" response instead of pretending.
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, language, context: buildContext() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer, actions: local.actions }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: local.text, actions: local.actions }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: local.text, actions: local.actions }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-[1100] flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 sm:bottom-6 sm:right-24"
        aria-label={t("aiAssistantTitle")}
      >
        <Bot className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-900/30 p-0 sm:items-center sm:p-4">
          <div className="flex h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:h-[70vh] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Bot className="h-4 w-4 text-teal-600" /> {t("aiAssistantTitle")}
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {isOffline && (
              <div className="flex items-center gap-1.5 border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-700">
                {t("aiAssistantOfflineBadge")} — {t("aiAssistantOfflineNote")}
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {messages.length === 0 && (
                <div>
                  <p className="mb-3 text-sm text-slate-600">{t("aiAssistantGreeting")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q.labelKey}
                        onClick={() => send(q.question, t(q.labelKey))}
                        className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
                      >
                        {t(q.labelKey)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-[10px] text-slate-400">{t("aiAssistantDemoDataNote")}</p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-xs ${
                      m.role === "user" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {m.text}
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.actions.map((a) => {
                          const meta = ACTION_META[a];
                          const Icon = meta.icon;
                          return (
                            <button
                              key={a}
                              onClick={() => handleAction(a)}
                              className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Icon className="h-3 w-3" /> {t(meta.labelKey)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-slate-200 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("aiAssistantInputPlaceholder")}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
