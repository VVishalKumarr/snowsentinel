"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Play, RotateCcw, MapPinned, Users, TriangleAlert } from "lucide-react";
import type { HazardScenario, Settlement } from "@/lib/types";
import StatCard from "./StatCard";

const HazardMap = dynamic(() => import("./HazardMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-slate-600">
      Loading map…
    </div>
  ),
});

const ZONE_LEGEND = [
  { emoji: "🔴", label: "HIGH IMPACT ZONE", color: "text-red-400" },
  { emoji: "🟠", label: "MONITORING ZONE", color: "text-orange-400" },
  { emoji: "🟢", label: "LOWER IMPACT ZONE", color: "text-emerald-400" },
];

const EXPOSURE_STYLE: Record<Settlement["exposure"], string> = {
  HIGH: "text-red-400 border-red-500/40 bg-red-500/10",
  MODERATE: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  LOW: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
};

export default function ImpactZone({ scenario }: { scenario: HazardScenario }) {
  const [simulateTrigger, setSimulateTrigger] = useState(0);
  const [simulationDone, setSimulationDone] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-200">HAZARD IMPACT MAP</h2>
          <span className="mt-0.5 inline-block rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-amber-300">
            SIMULATED POTENTIAL IMPACT ZONE — NOT AN ACTUAL EVACUATION MAP
          </span>
        </div>
        <button
          onClick={() => {
            setSimulationDone(false);
            setSimulateTrigger((t) => t + 1);
          }}
          className="flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/15 px-4 py-2 text-xs font-semibold tracking-wide text-orange-300 transition-colors hover:bg-orange-500/25"
        >
          {simulateTrigger > 0 ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          SIMULATE HAZARD PATH
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-4">
        {ZONE_LEGEND.map((z) => (
          <span key={z.label} className={`flex items-center gap-1.5 text-[11px] font-medium ${z.color}`}>
            <span>{z.emoji}</span>
            {z.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="h-[460px] overflow-hidden rounded-xl border border-white/10">
          <HazardMap
            scenario={scenario}
            simulateTrigger={simulateTrigger}
            onSelectSettlement={setSelectedSettlement}
            selectedSettlementId={selectedSettlement?.id ?? null}
            onSimulationComplete={() => setSimulationDone(true)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400">
              <MapPinned className="h-3.5 w-3.5" /> SETTLEMENT DETAIL
            </div>
            {selectedSettlement ? (
              <div className="space-y-2 text-xs">
                <div className="text-sm font-semibold text-slate-100">{selectedSettlement.name}</div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Potential exposure</span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                      EXPOSURE_STYLE[selectedSettlement.exposure]
                    }`}
                  >
                    {selectedSettlement.exposure}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Distance from simulated path</span>
                  <span className="font-mono text-slate-200">{selectedSettlement.distanceFromPathKm} km</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <Users className="h-3 w-3" />
                  <span className="font-mono text-slate-200">~{selectedSettlement.population}</span>
                </div>
                <div className="border-t border-white/10 pt-2 text-slate-400">
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">
                    RECOMMENDED PREPAREDNESS
                  </span>
                  <p className="mt-1 text-slate-300">{selectedSettlement.preparedness}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">Click a settlement marker (🏠) on the map to view details.</p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-slate-500">
            <div className="mb-1 font-semibold tracking-wide text-slate-400">MAP LEGEND</div>
            <div className="space-y-1">
              <div>🏔️ Mountain / source zone</div>
              <div>🏠 Settlement</div>
              <div>🛣️ Road</div>
              <div>🌉 Bridge</div>
              <div>🏥 Medical facility</div>
              <div>🏫 School</div>
            </div>
          </div>
        </div>
      </div>

      {simulationDone && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-orange-300">
            <TriangleAlert className="h-4 w-4" />
            Potential downstream exposure detected.
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Potential affected area"
              value={`${scenario.simulatedStats.affectedAreaKm2} km²`}
              tone="warning"
              sublabel="Simulated demo value"
            />
            <StatCard
              label="Potentially exposed settlements"
              value={scenario.simulatedStats.exposedSettlements}
              tone="warning"
              sublabel="Simulated demo value"
            />
            <StatCard
              label="Critical infrastructure"
              value={scenario.simulatedStats.criticalInfrastructure}
              tone="warning"
              sublabel="Simulated demo value"
            />
          </div>
        </div>
      )}
    </div>
  );
}
