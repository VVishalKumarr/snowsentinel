"use client";

import type { HazardScenario } from "@/lib/types";
import { buildPriorityZones } from "@/lib/emergencyData";
import { PRIORITY_LABEL_KEY } from "@/lib/emergencyTypes";
import type { TranslationKey } from "@/lib/i18n/en";
import { useLanguage } from "@/lib/i18n";

const LEVEL_STYLE: Record<number, string> = {
  1: "border-red-300 bg-red-50 text-red-700",
  2: "border-orange-300 bg-orange-50 text-orange-700",
  3: "border-amber-300 bg-amber-50 text-amber-700",
  4: "border-emerald-300 bg-emerald-50 text-emerald-700",
};

const LEVEL_DOT: Record<number, string> = {
  1: "🔴",
  2: "🟠",
  3: "🟡",
  4: "🟢",
};

const EXPOSURE_LABEL_KEY: Record<"HIGH" | "MODERATE" | "LOW", TranslationKey> = {
  HIGH: "populationExposureHigh",
  MODERATE: "populationExposureModerate",
  LOW: "populationExposureLow",
};

export default function PriorityZonePanel({ scenario }: { scenario: HazardScenario }) {
  const { t } = useLanguage();
  const zones = buildPriorityZones(scenario, t).sort((a, b) => a.level - b.level);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("priorityZonesTitle")}</h2>
        <span className="rounded border border-slate-200 px-2 py-0.5 text-[9px] tracking-wide text-slate-500">
          {t("priorityZonesBadge")}
        </span>
      </div>
      <p className="mb-4 text-xs text-slate-500">{t("priorityZonesDescription")}</p>

      <div className="space-y-3">
        {zones.map((z) => (
          <div key={z.id} className={`rounded-xl border p-3 ${LEVEL_STYLE[z.level]}`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide">
                {LEVEL_DOT[z.level]} {t(PRIORITY_LABEL_KEY[z.level])}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700 sm:grid-cols-4">
              <div>
                <div className="text-[10px] text-slate-500">{t("fieldSettlement")}</div>
                <div className="font-medium">{z.settlementName}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">{t("fieldPopulationExposure")}</div>
                <div className="font-medium">{t(EXPOSURE_LABEL_KEY[z.populationExposure])}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">{t("fieldNearestShelter")}</div>
                <div className="font-mono font-medium">{t("distanceKm", { value: z.nearestShelterKm })}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">{t("fieldNearestHospital")}</div>
                <div className="font-mono font-medium">{t("distanceKm", { value: z.nearestHospitalKm })}</div>
              </div>
            </div>
            <p className="mt-2 text-xs italic text-slate-600">&ldquo;{z.recommendedResponse}&rdquo;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
