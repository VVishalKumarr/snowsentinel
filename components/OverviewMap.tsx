"use client";

import dynamic from "next/dynamic";
import type { HazardScenario } from "@/lib/types";

const HazardMap = dynamic(() => import("./HazardMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">Loading map…</div>
  ),
});

export default function OverviewMap({ scenario }: { scenario: HazardScenario }) {
  return (
    <div className="h-[380px] overflow-hidden rounded-2xl border border-slate-200">
      <HazardMap
        scenario={scenario}
        simulateTrigger={0}
        onSelectSettlement={() => {}}
        selectedSettlementId={null}
        onSimulationComplete={() => {}}
      />
    </div>
  );
}
