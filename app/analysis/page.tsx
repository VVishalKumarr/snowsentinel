"use client";

import Navbar from "@/components/Navbar";
import ImpactZone from "@/components/ImpactZone";
import WarningPanel from "@/components/WarningPanel";
import AnalysisPanel from "@/components/AnalysisPanel";
import RiskIndicator from "@/components/RiskIndicator";
import { useScenario } from "@/lib/ScenarioContext";

export default function AnalysisPage() {
  const { scenario } = useScenario();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-slate-100">
              HAZARD IMPACT &amp; PREPAREDNESS
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {scenario.name} — {scenario.region.shortName} demo region
            </p>
          </div>
          <RiskIndicator level={scenario.risk.riskLevel} size="sm" />
        </div>

        <div className="space-y-6">
          <ImpactZone scenario={scenario} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <WarningPanel scenario={scenario} />
            <AnalysisPanel scenario={scenario} />
          </div>
        </div>
      </main>
    </div>
  );
}
