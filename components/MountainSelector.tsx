"use client";

import type { ReactNode } from "react";
import { ChevronDown, Calendar, MapPin, FlaskConical } from "lucide-react";
import { useScenario } from "@/lib/ScenarioContext";
import { REGIONS } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

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
  const { scenario, scenarioId, setScenarioId, setRegionId, scenariosForCurrentRegion } = useScenario();
  const { t } = useLanguage();

  return (
    <div className="glass-panel flex flex-wrap items-end gap-x-8 gap-y-4 rounded-2xl p-4 sm:p-5">
      <ControlBlock icon={MapPin} label={t("controlRegion")}>
        <div className="relative">
          <select
            value={scenario.region.id}
            onChange={(e) => setRegionId(e.target.value)}
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

      <ControlBlock icon={Calendar} label={t("controlObservation")}>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800">
          {t("controlObservationCurrent")}
        </div>
      </ControlBlock>

      <ControlBlock icon={Calendar} label={t("controlDate")}>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm text-teal-700">
          {scenario.observationCurrent.date}
        </div>
      </ControlBlock>

      <ControlBlock icon={FlaskConical} label={t("controlDemoScenario")}>
        <div className="relative">
          <select
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            className="appearance-none rounded-lg border border-teal-300 bg-teal-50 py-1.5 pl-3 pr-8 text-sm text-teal-800 outline-none focus:border-teal-500"
          >
            {scenariosForCurrentRegion.map((s) => (
              <option key={s.id} value={s.id}>
                {t(s.nameKey)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-600" />
        </div>
      </ControlBlock>
    </div>
  );
}
