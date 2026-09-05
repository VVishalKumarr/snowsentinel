"use client";

import type { ReactNode } from "react";
import { ChevronDown, Calendar, MapPin, FlaskConical } from "lucide-react";
import { useScenario } from "@/lib/ScenarioContext";
import { REGIONS } from "@/lib/demoData";

function ControlBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.1em] text-slate-500">
        <Icon className="h-3 w-3" strokeWidth={2} />
        {label}
      </div>
      {children}
    </div>
  );
}

export default function MountainSelector() {
  const { scenario, scenarioId, setScenarioId, scenarios } = useScenario();

  return (
    <div className="glass-panel flex flex-wrap items-end gap-x-8 gap-y-4 rounded-2xl p-4 sm:p-5">
      <ControlBlock icon={MapPin} label="REGION">
        <div className="relative">
          <select
            defaultValue="khumbu"
            className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-800 outline-none focus:border-teal-400"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id} disabled={!r.available}>
                {r.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        </div>
      </ControlBlock>

      <ControlBlock icon={Calendar} label="OBSERVATION">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800">
          Current
        </div>
      </ControlBlock>

      <ControlBlock icon={Calendar} label="DATE">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm text-teal-700">
          {scenario.observationCurrent.date}
        </div>
      </ControlBlock>

      <ControlBlock icon={FlaskConical} label="DEMO SCENARIO">
        <div className="relative">
          <select
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            className="appearance-none rounded-lg border border-teal-300 bg-teal-50 py-1.5 pl-3 pr-8 text-sm text-teal-800 outline-none focus:border-teal-500"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-600" />
        </div>
      </ControlBlock>
    </div>
  );
}
