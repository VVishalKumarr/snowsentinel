"use client";

import { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import RiskIndicator, { RiskScale } from "./RiskIndicator";
import { RISK_LEVEL_COLORS } from "@/lib/riskEngine";
import { useLanguage } from "@/lib/i18n";

function FactorBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {label} <span className="text-slate-400">({Math.round(weight * 100)}%)</span>
        </span>
        <span className="font-mono font-medium text-slate-800">{score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function RiskPanel({ scenario }: { scenario: HazardScenario }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");

  const runAssessment = () => {
    setStatus("analyzing");
    setTimeout(() => setStatus("done"), 1100);
  };

  const { risk } = scenario;
  const colors = RISK_LEVEL_COLORS[risk.riskLevel];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("riskStatusTitle")}</h2>
        <span className="rounded border border-slate-200 px-2 py-0.5 text-[9px] tracking-wide text-slate-500">
          {t("riskStatusBadge")}
        </span>
      </div>

      {status === "idle" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 py-10 text-center">
          <ScanLine className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
          <p className="max-w-xs text-xs text-slate-500">{t("riskIdleDescription")}</p>
          <button
            onClick={runAssessment}
            className="mt-1 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-teal-700"
          >
            {t("runRiskAssessment")}
          </button>
        </div>
      )}

      {status === "analyzing" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-teal-200 bg-teal-50 py-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" strokeWidth={1.75} />
          <p className="text-xs tracking-wide text-teal-700">{t("analyzingObservationData")}</p>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <RiskIndicator level={risk.riskLevel} />
            <div className="text-right">
              <div className="text-[10px] tracking-wide text-slate-500">{t("riskScoreLabel")}</div>
              <div className={`text-3xl font-bold tabular-nums ${colors.text}`}>
                {risk.riskScore}
                <span className="text-lg text-slate-400">/100</span>
              </div>
            </div>
          </div>

          <RiskScale active={risk.riskLevel} />

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="text-[11px] font-semibold tracking-[0.1em] text-slate-500">
              {t("riskFactorBreakdown")}
            </h3>
            {risk.factors.map((f) => (
              <FactorBar key={f.key} label={t(f.labelKey)} score={f.score} weight={f.weight} />
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-medium text-slate-600">{t("riskFormulaText")}</div>
            <div className="mt-1.5 text-[10px] text-slate-500">{t(risk.weightingNote)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
