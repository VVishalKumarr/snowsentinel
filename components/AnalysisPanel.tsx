"use client";

import { useState } from "react";
import { Sparkles, Loader2, ListChecks, ChevronDown } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import { HUMAN_VERIFICATION_STEPS } from "@/lib/demoData";

interface ApiResult {
  explanation: string;
  dataSource: "AI" | "DEMO";
  humanVerificationSteps?: string[];
}

export default function AnalysisPanel({ scenario }: { scenario: HazardScenario }) {
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
          }),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        setResult({ explanation: scenario.explanation, dataSource: "DEMO" });
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
          <Sparkles className="h-4.5 w-4.5 text-cyan-400" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold tracking-wide text-slate-200">
            WHY DID SNOWSENTINEL FLAG THIS REGION?
          </h2>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-cyan-300">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating explanation from structured observation data…
            </div>
          ) : (
            result && (
              <div>
                <p className="text-sm leading-relaxed text-slate-300">{result.explanation}</p>
                <span
                  className={`mt-2 inline-block rounded border px-2 py-0.5 text-[9px] font-semibold tracking-wide ${
                    result.dataSource === "AI"
                      ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                      : "border-slate-500/40 bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {result.dataSource === "AI" ? "AI-GENERATED (LIVE API)" : "DEMO EXPLANATION (TEMPLATE)"}
                </span>
              </div>
            )
          )}

          <div className="border-t border-white/10 pt-4">
            <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] text-slate-400">
              <ListChecks className="h-3.5 w-3.5" /> WHAT SHOULD A HUMAN VERIFY?
            </h3>
            <ol className="space-y-1.5">
              {verificationSteps.map((step, i) => (
                <li key={step} className="flex gap-2 text-sm text-slate-300">
                  <span className="font-mono text-slate-600">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
            <p className="text-sm font-medium italic text-slate-400">
              &ldquo;Technology can detect the signal. Humans still make the decision.&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
