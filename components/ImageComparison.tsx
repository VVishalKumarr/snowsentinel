"use client";

import { useState } from "react";
import SatelliteViewer, { ViewerVariant } from "./SatelliteViewer";
import Timeline from "./Timeline";
import type { HazardScenario } from "@/lib/types";

const TABS: { id: ViewerVariant; label: string }[] = [
  { id: "current", label: "CURRENT" },
  { id: "previous", label: "PREVIOUS" },
  { id: "compare", label: "COMPARE" },
];

function ChangeBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-medium text-slate-200">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ImageComparison({ scenario }: { scenario: HazardScenario }) {
  const [variant, setVariant] = useState<ViewerVariant>("current");
  const change = scenario.environmentalChange;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">SATELLITE OBSERVATION</h2>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVariant(tab.id)}
              className={`rounded-md px-3 py-1 text-[11px] font-semibold tracking-wide transition-colors ${
                variant === tab.id
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <SatelliteViewer scenario={scenario} variant={variant} />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-medium tracking-wide text-slate-500">CURRENT OBSERVATION</div>
          <div className="font-mono text-sm text-slate-200">{scenario.observationCurrent.date}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium tracking-wide text-slate-500">PREVIOUS OBSERVATION</div>
          <div className="font-mono text-sm text-slate-200">{scenario.observationPrevious.date}</div>
        </div>
      </div>

      <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
        <h3 className="text-xs font-semibold tracking-[0.1em] text-slate-400">ENVIRONMENTAL CHANGE</h3>
        <ChangeBar label="Snow / Ice Change" value={change.snowIceChangePct} />
        <ChangeBar label="Surface Change" value={change.surfaceChangePct} />
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
          <span className="text-slate-400">Change from Previous Observation</span>
          <span className="font-mono font-semibold text-cyan-300">+{change.deltaFromPrevious}%</span>
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <h3 className="mb-3 text-xs font-semibold tracking-[0.1em] text-slate-400">OBSERVATION TIMELINE</h3>
        <Timeline points={scenario.timeline} />
        <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-cyan-500/70" /> Snow/Ice index
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-slate-400/40" /> Surface index
          </span>
        </div>
      </div>
    </div>
  );
}
