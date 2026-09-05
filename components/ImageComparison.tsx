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
        <span className="text-slate-500">{label}</span>
        <span className="font-mono font-medium text-slate-800">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-700"
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
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">SATELLITE OBSERVATION</h2>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVariant(tab.id)}
              className={`rounded-md px-3 py-1 text-[11px] font-semibold tracking-wide transition-colors ${
                variant === tab.id
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
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
          <div className="font-mono text-sm text-slate-800">{scenario.observationCurrent.date}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium tracking-wide text-slate-500">PREVIOUS OBSERVATION</div>
          <div className="font-mono text-sm text-slate-800">{scenario.observationPrevious.date}</div>
        </div>
      </div>

      <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
        <h3 className="text-xs font-semibold tracking-[0.1em] text-slate-500">ENVIRONMENTAL CHANGE</h3>
        <ChangeBar label="Snow / Ice Change" value={change.snowIceChangePct} />
        <ChangeBar label="Surface Change" value={change.surfaceChangePct} />
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
          <span className="text-slate-500">Change from Previous Observation</span>
          <span className="font-mono font-semibold text-teal-700">+{change.deltaFromPrevious}%</span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5">
        <h3 className="mb-3 text-xs font-semibold tracking-[0.1em] text-slate-500">OBSERVATION TIMELINE</h3>
        <Timeline points={scenario.timeline} />
        <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-teal-500" /> Snow/Ice index
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-slate-300" /> Surface index
          </span>
        </div>
      </div>
    </div>
  );
}
