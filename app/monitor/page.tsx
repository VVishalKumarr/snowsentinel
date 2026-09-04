"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import MountainSelector from "@/components/MountainSelector";
import ImageComparison from "@/components/ImageComparison";
import RiskPanel from "@/components/RiskPanel";
import { useScenario } from "@/lib/ScenarioContext";

export default function MonitorPage() {
  const { scenario } = useScenario();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold tracking-wide text-slate-100">
            MOUNTAIN HAZARD MONITOR
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {scenario.region.description} — this dashboard uses demo/synthetic data throughout.
          </p>
        </div>

        <div className="mb-6">
          <MountainSelector />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <ImageComparison scenario={scenario} />
          <RiskPanel scenario={scenario} />
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href="/analysis"
            className="group flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold tracking-wide text-slate-950 transition-colors hover:bg-cyan-400"
          >
            VIEW HAZARD IMPACT MAP
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
