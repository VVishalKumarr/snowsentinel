"use client";

import { useState } from "react";
import { Ambulance as AmbulanceIcon, MapPin } from "lucide-react";
import { getAmbulances, DEMO_SYNC_TIME } from "@/lib/emergencyData";
import type { AmbulanceStatus } from "@/lib/emergencyTypes";
import type { TranslationKey } from "@/lib/i18n/en";
import { useScenario } from "@/lib/ScenarioContext";
import { useLanguage } from "@/lib/i18n";

function mapsUrl(position: [number, number]): string {
  return `https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`;
}

const STATUS_STYLE: Record<AmbulanceStatus, string> = {
  AVAILABLE: "border-emerald-300 bg-emerald-50 text-emerald-700",
  EN_ROUTE: "border-amber-300 bg-amber-50 text-amber-700",
  UNAVAILABLE: "border-slate-300 bg-slate-100 text-slate-500",
};

const STATUS_LABEL_KEY: Record<AmbulanceStatus, TranslationKey> = {
  AVAILABLE: "ambulanceStatusAvailable",
  EN_ROUTE: "ambulanceStatusEnRoute",
  UNAVAILABLE: "ambulanceStatusUnavailable",
};

export default function AmbulanceList() {
  const { scenario } = useScenario();
  const { t } = useLanguage();
  const ambulances = getAmbulances(scenario.region.id);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("ambulanceListTitle")}</h2>
        <span className="text-[10px] text-slate-400">{t("nearbyHelpLastSync", { time: DEMO_SYNC_TIME })}</span>
      </div>
      <p className="mb-4 text-xs text-slate-500">{t("ambulanceListDescription")}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ambulances.map((a) => (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-800">
                <AmbulanceIcon className="h-4 w-4 flex-shrink-0 text-teal-600" /> <span className="truncate">{a.name}</span>
              </div>
              <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[a.status]}`}>
                {t(STATUS_LABEL_KEY[a.status])}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>
                <div className="text-[10px] text-slate-400">{t("distance")}</div>
                <div className="font-mono text-slate-700">{t("distanceKm", { value: a.distanceKm })}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">{t("estimatedResponse")}</div>
                <div className="font-mono text-slate-700">{t("minUnit", { value: a.etaMinutes })}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                disabled={a.status !== "AVAILABLE" || requested.has(a.id)}
                onClick={() => setRequested((prev) => new Set(prev).add(a.id))}
                className="flex-1 rounded-lg bg-teal-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {t(requested.has(a.id) ? "requestSentDemo" : "requestHelp")}
              </button>
              <a
                href={mapsUrl(a.position)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <MapPin className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
