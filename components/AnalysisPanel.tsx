"use client";

import { useState } from "react";
import { Sparkles, Loader2, ListChecks, ChevronDown } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/en";
import { HUMAN_VERIFICATION_STEPS } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

interface ApiResult {
  explanation: string;
  dataSource: "AI" | "DEMO";
  humanVerificationSteps?: TranslationKey[];
}

export default function AnalysisPanel({ scenario }: { scenario: HazardScenario }) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !result && !loading) {
      setLoading(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            scenarioId: scenario.id,
            region: scenario.region.name,
            currentObservation: scenario.observationCurrent.date,
            previousObservation: scenario.observationPrevious.date,
            language,
          }),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        setResult({ explanation: t(scenario.explanationKey, { region: scenario.region.shortName }), dataSource: "DEMO" });
      } finally {
        setLoading(false);
      }
    }
  };

  const verificationSteps = result?.humanVerificationSteps ?? HUMAN_VERIFICATION_STEPS;

  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4.5 w-4.5 text-teal-600" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold tracking-wide text-slate-800">
            {t("analysisWhyFlagged")}
          </h2>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-200 px-4 pb-5 pt-4 sm:px-5">
          <div className="flex flex-wrap gap-1.5 text-[9px] font-semibold tracking-wide">
            <span className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-slate-600">{t("analysisObservedData")}</span>
            <span className="rounded border border-teal-300 bg-teal-50 px-2 py-0.5 text-teal-700">{t("analysisSimulatedData")}</span>
            <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-700">{t("analysisInference")}</span>
            <span className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-slate-600">{t("analysisRecommendation")}</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-teal-700">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("analysisGenerating")}
            </div>
          ) : (
            result && (
              <div>
                <p className="text-sm leading-relaxed text-slate-700">{result.explanation}</p>
                <span
                  className={`mt-2 inline-block rounded border px-2 py-0.5 text-[9px] font-semibold tracking-wide ${
                    result.dataSource === "AI"
                      ? "border-teal-300 bg-teal-50 text-teal-700"
                      : "border-slate-300 bg-slate-50 text-slate-500"
                  }`}
                >
                  {result.dataSource === "AI" ? t("analysisAiGenerated") : t("analysisDemoTemplate")}
                </span>
              </div>
            )
          )}

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] text-slate-500">
              <ListChecks className="h-3.5 w-3.5" /> {t("analysisWhatToVerify")}
            </h3>
            <ol className="space-y-1.5">
              {verificationSteps.map((step, i) => (
                <li key={step} className="flex gap-2 text-sm text-slate-700">
                  <span className="font-mono text-slate-400">{i + 1}.</span>
                  {t(step)}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
            <p className="text-sm font-medium italic text-slate-600">&ldquo;{t("analysisQuote")}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  );
}
