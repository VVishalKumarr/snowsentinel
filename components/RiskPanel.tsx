"use client";

import { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import RiskIndicator, { RiskScale } from "./RiskIndicator";
import { RISK_LEVEL_COLORS } from "@/lib/riskEngine";

function FactorBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          {label} <span className="text-slate-600">({Math.round(weight * 100)}%)</span>
        </span>
        <span className="font-mono font-medium text-slate-200">{score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300 transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function RiskPanel({ scenario }: { scenario: HazardScenario }) {
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
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">CURRENT HAZARD STATUS</h2>
        <span className="rounded border border-white/10 px-2 py-0.5 text-[9px] tracking-wide text-slate-500">
          EXPERIMENTAL HAZARD-RISK INDICATOR
        </span>
      </div>

      {status === "idle" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 py-10 text-center">
          <ScanLine className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          <p className="max-w-xs text-xs text-slate-500">
            Run the experimental risk model against the current observation data for this region.
          </p>
          <button
            onClick={runAssessment}
            className="mt-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-300 transition-colors hover:bg-cyan-500/25"
          >
            RUN RISK ASSESSMENT
          </button>
        </div>
      )}

      {status === "analyzing" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 py-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" strokeWidth={1.75} />
          <p className="text-xs tracking-wide text-cyan-300">Analyzing observation data…</p>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <RiskIndicator level={risk.riskLevel} />
            <div className="text-right">
              <div className="text-[10px] tracking-wide text-slate-500">RISK SCORE</div>
              <div className={`text-3xl font-bold tabular-nums ${colors.text}`}>
                {risk.riskScore}
                <span className="text-lg text-slate-600">/100</span>
              </div>
            </div>
          </div>

          <RiskScale active={risk.riskLevel} />

          <div className="space-y-3 border-t border-white/10 pt-4">
            <h3 className="text-[11px] font-semibold tracking-[0.1em] text-slate-500">
              RISK FACTOR BREAKDOWN
            </h3>
            {risk.factors.map((f) => (
              <FactorBar key={f.key} label={f.label} score={f.score} weight={f.weight} />
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[11px] font-medium text-slate-400">
              Risk Score = 30% observed change + 25% environmental conditions + 25% historical hazard + 20% terrain exposure
            </div>
            <div className="mt-1.5 text-[10px] text-slate-600">{risk.weightingNote}</div>
          </div>
        </div>
      )}
    </div>
  );
}
