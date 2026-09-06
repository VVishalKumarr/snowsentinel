"use client";

import { useState } from "react";
import { Hospital, Shield, Flame, Building2, PhoneCall, Navigation } from "lucide-react";
import { getEmergencyServices, DEMO_SYNC_TIME } from "@/lib/emergencyData";
import type { EmergencyServiceType, EmergencyServiceStatus } from "@/lib/emergencyTypes";
import { useScenario } from "@/lib/ScenarioContext";
import { useLanguage } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

const TYPE_META: Record<EmergencyServiceType, { labelKey: TranslationKey; icon: typeof Hospital; emoji: string }> = {
  hospital: { labelKey: "serviceTypeHospital", icon: Hospital, emoji: "🏥" },
  police: { labelKey: "serviceTypePolice", icon: Shield, emoji: "👮" },
  fire: { labelKey: "serviceTypeFire", icon: Flame, emoji: "🚒" },
  ambulance: { labelKey: "serviceTypeAmbulance", icon: Building2, emoji: "🚑" },
  response_center: { labelKey: "serviceTypeResponseCenter", icon: Building2, emoji: "🏢" },
};

const STATUS_LABEL_KEY: Record<EmergencyServiceStatus, TranslationKey> = {
  OPEN_24_7: "serviceStatusOpen247",
  OPEN_8_TO_8: "serviceStatusOpen8to8",
  STAFFED: "serviceStatusStaffed",
  OPERATIONAL: "serviceStatusOperational",
};

const FILTERS: { id: EmergencyServiceType | "all"; labelKey: TranslationKey }[] = [
  { id: "all", labelKey: "filterAll" },
  { id: "hospital", labelKey: "filterHospitals" },
  { id: "police", labelKey: "filterPolice" },
  { id: "fire", labelKey: "filterFire" },
  { id: "response_center", labelKey: "filterResponseCenters" },
];

function directionsUrl(position: [number, number]) {
  return `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;
}

export default function NearbyHelpList() {
  const { scenario } = useScenario();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<EmergencyServiceType | "all">("all");

  const services = getEmergencyServices(scenario.region.id)
    .filter((s) => filter === "all" || s.type === filter)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("nearbyHelpTitle")}</h2>
        <span className="text-[10px] text-slate-400">{t("nearbyHelpLastSync", { time: DEMO_SYNC_TIME })}</span>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        {t("nearbyHelpDescription")}{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5">lib/emergencyData.ts</code>.
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              filter === f.id
                ? "border-teal-300 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {services.map((s) => {
          const meta = TYPE_META[s.type];
          return (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <span>{meta.emoji}</span> <span className="truncate">{s.name}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span>{t(meta.labelKey)}</span>
                    <span>·</span>
                    <span className="font-mono">{t("distanceKm", { value: s.distanceKm })}</span>
                    {s.status && (
                      <>
                        <span>·</span>
                        <span>{t(STATUS_LABEL_KEY[s.status])}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  {s.phone ? (
                    <a
                      href={`tel:${s.phone}`}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md bg-teal-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700 sm:flex-initial"
                    >
                      <PhoneCall className="h-3 w-3" /> {t("call")}
                    </a>
                  ) : (
                    <span className="flex flex-1 items-center justify-center rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-400 sm:flex-initial">
                      {t("useHelpline")}
                    </span>
                  )}
                  <a
                    href={directionsUrl(s.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 sm:flex-initial"
                  >
                    <Navigation className="h-3 w-3" /> {t("directions")}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
