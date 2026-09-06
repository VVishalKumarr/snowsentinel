"use client";

import { useMemo, useState } from "react";
import { Tent, Navigation, Accessibility } from "lucide-react";
import { getShelters } from "@/lib/emergencyData";
import type { Shelter, AccessibilityCode } from "@/lib/emergencyTypes";
import { useScenario } from "@/lib/ScenarioContext";
import { useLanguage } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

type FilterId = "open" | "available" | "full" | "accessible";

const FILTERS: { id: FilterId; labelKey: TranslationKey }[] = [
  { id: "open", labelKey: "shelterFilterOpen" },
  { id: "available", labelKey: "shelterFilterAvailable" },
  { id: "full", labelKey: "shelterFilterFull" },
  { id: "accessible", labelKey: "shelterFilterAccessible" },
];

const ACCESSIBILITY_LABEL_KEY: Record<AccessibilityCode, TranslationKey> = {
  WHEELCHAIR_GROUND_FLOOR: "accessWheelchairGroundFloor",
  STAIRS_ONLY: "accessStairsOnly",
  WHEELCHAIR_ACCESSIBLE: "accessWheelchairAccessible",
  STAIRS_ONLY_NO_WHEELCHAIR: "accessStairsOnlyNoWheelchair",
};

const WHEELCHAIR_ACCESSIBLE_CODES: AccessibilityCode[] = ["WHEELCHAIR_GROUND_FLOOR", "WHEELCHAIR_ACCESSIBLE"];

function matchesFilter(s: Shelter, active: Set<FilterId>) {
  if (active.size === 0) return true;
  const available = s.capacity - s.occupied;
  if (active.has("open") && !s.isOpen) return false;
  if (active.has("available") && available <= 0) return false;
  if (active.has("full") && available > 0) return false;
  if (active.has("accessible") && !WHEELCHAIR_ACCESSIBLE_CODES.includes(s.accessibility)) return false;
  return true;
}

function directionsUrl(position: [number, number]) {
  return `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;
}

export default function ShelterList() {
  const { scenario } = useScenario();
  const { t } = useLanguage();
  const [active, setActive] = useState<Set<FilterId>>(new Set());

  const toggle = (id: FilterId) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const shelters = useMemo(
    () => getShelters(scenario.region.id).filter((s) => matchesFilter(s, active)).sort((a, b) => a.distanceKm - b.distanceKm),
    [active, scenario.region.id]
  );

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("nearbySheltersTitle")}</h2>
        <span className="rounded border border-slate-200 px-2 py-0.5 text-[9px] tracking-wide text-slate-500">
          {t("demoDataBadge")}
        </span>
      </div>
      <p className="mb-4 text-xs text-slate-500">{t("shelterListDescription")}</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => toggle(f.id)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              active.has(f.id)
                ? "border-teal-300 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {shelters.map((s) => {
          const available = s.capacity - s.occupied;
          return (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Tent className="h-4 w-4 text-teal-600" /> {s.name}
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    s.isOpen ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-slate-100 text-slate-500"
                  }`}
                >
                  {t(s.isOpen ? "statusOpen" : "statusClosed")}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div>
                  <div className="text-[10px] text-slate-400">{t("fieldDistance")}</div>
                  <div className="font-mono text-slate-700">{t("distanceKm", { value: s.distanceKm })}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">{t("fieldCapacity")}</div>
                  <div className="font-mono text-slate-700">{s.capacity}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">{t("fieldOccupied")}</div>
                  <div className="font-mono text-slate-700">{s.occupied}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">{t("fieldAvailable")}</div>
                  <div className={`font-mono font-semibold ${available > 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {available}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                <Accessibility className="h-3.5 w-3.5" /> {t(ACCESSIBILITY_LABEL_KEY[s.accessibility])}
              </div>

              <a
                href={directionsUrl(s.position)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
              >
                <Navigation className="h-3.5 w-3.5" /> {t("getDirections")}
              </a>

              <div className="mt-2 text-right text-[9px] text-slate-400">{t("lastSynced", { time: s.lastSynced })}</div>
            </div>
          );
        })}
        {shelters.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-slate-400">{t("noSheltersMatch")}</p>
        )}
      </div>
    </div>
  );
}
