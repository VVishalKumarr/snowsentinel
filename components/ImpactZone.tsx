"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Play, RotateCcw, MapPinned, Users, TriangleAlert } from "lucide-react";
import type { HazardScenario, Settlement } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/en";
import { useLanguage } from "@/lib/i18n";
import StatCard from "./StatCard";
import MapLayerControls from "./MapLayerControls";
import { DEFAULT_LAYERS, type MapLayerToggles } from "@/lib/mapLayers";
import { getShelters, getEmergencyServices, getAmbulances } from "@/lib/emergencyData";

function MapLoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
      {t("impactZoneLoadingMap")}
    </div>
  );
}

const HazardMap = dynamic(() => import("./HazardMap"), {
  ssr: false,
  loading: MapLoadingFallback,
});

const ZONE_LEGEND: { emoji: string; labelKey: TranslationKey; color: string }[] = [
  { emoji: "🔴", labelKey: "zoneLabelHigh", color: "text-red-600" },
  { emoji: "🟠", labelKey: "zoneLabelMonitoring", color: "text-orange-600" },
  { emoji: "🟢", labelKey: "zoneLabelLower", color: "text-emerald-600" },
];

const EXPOSURE_STYLE: Record<Settlement["exposure"], string> = {
  HIGH: "text-red-700 border-red-300 bg-red-50",
  MODERATE: "text-orange-700 border-orange-300 bg-orange-50",
  LOW: "text-emerald-700 border-emerald-300 bg-emerald-50",
};

const EXPOSURE_LABEL_KEY: Record<Settlement["exposure"], TranslationKey> = {
  HIGH: "exposureHigh",
  MODERATE: "exposureModerate",
  LOW: "exposureLow",
};

export default function ImpactZone({
  scenario,
  autoSimulateSignal = 0,
}: {
  scenario: HazardScenario;
  autoSimulateSignal?: number;
}) {
  const { t } = useLanguage();
  const [simulateTrigger, setSimulateTrigger] = useState(0);
  const [simulationDone, setSimulationDone] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [layers, setLayers] = useState<MapLayerToggles>(DEFAULT_LAYERS);

  useEffect(() => {
    if (autoSimulateSignal > 0) {
      setSimulationDone(false);
      setSimulateTrigger((t) => t + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSimulateSignal]);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("impactMapTitle")}</h2>
          <span className="mt-0.5 inline-block rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-amber-700">
            {t("impactMapWarningBadge")}
          </span>
        </div>
        <button
          onClick={() => {
            setSimulationDone(false);
            setSimulateTrigger((t) => t + 1);
          }}
          className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-500 px-4 py-2 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-orange-600"
        >
          {simulateTrigger > 0 ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {t("simulateHazardPath")}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4">
          {ZONE_LEGEND.map((z) => (
            <span key={z.labelKey} className={`flex items-center gap-1.5 text-[11px] font-medium ${z.color}`}>
              <span>{z.emoji}</span>
              {t(z.labelKey)}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
        <MapLayerControls layers={layers} onChange={setLayers} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="h-[460px] overflow-hidden rounded-xl border border-slate-200">
          <HazardMap
            scenario={scenario}
            simulateTrigger={simulateTrigger}
            onSelectSettlement={setSelectedSettlement}
            selectedSettlementId={selectedSettlement?.id ?? null}
            onSimulationComplete={() => setSimulationDone(true)}
            layers={layers}
            shelters={getShelters(scenario.region.id)}
            services={getEmergencyServices(scenario.region.id)}
            ambulances={getAmbulances(scenario.region.id)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500">
              <MapPinned className="h-3.5 w-3.5" /> {t("settlementDetailTitle")}
            </div>
            {selectedSettlement ? (
              <div className="space-y-2 text-xs">
                <div className="text-sm font-semibold text-slate-800">{selectedSettlement.name}</div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>{t("potentialExposure")}</span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                      EXPOSURE_STYLE[selectedSettlement.exposure]
                    }`}
                  >
                    {t(EXPOSURE_LABEL_KEY[selectedSettlement.exposure])}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>{t("distanceFromPath")}</span>
                  <span className="font-mono text-slate-800">{t("distanceKm", { value: selectedSettlement.distanceFromPathKm })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="h-3 w-3" />
                  <span className="font-mono text-slate-800">~{selectedSettlement.population}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 text-slate-500">
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">
                    {t("recommendedPreparedness")}
                  </span>
                  <p className="mt-1 text-slate-700">{t(selectedSettlement.preparednessKey)}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">{t("clickSettlementPrompt")}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">
            <div className="mb-1 font-semibold tracking-wide text-slate-600">{t("mapLegendTitle")}</div>
            <div className="space-y-1">
              <div>{t("legendMountainSource")}</div>
              <div>{t("legendSettlement")}</div>
              <div>{t("legendShelterSafeZone")}</div>
              <div>{t("legendHospitalPoliceFire")}</div>
              <div>{t("legendAmbulanceRoadBridge")}</div>
            </div>
          </div>
        </div>
      </div>

      {simulationDone && (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
            <TriangleAlert className="h-4 w-4" />
            {t("potentialDownstreamExposure")}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label={t("potentialAffectedArea")}
              value={t("areaKm2", { value: scenario.simulatedStats.affectedAreaKm2 })}
              tone="warning"
              sublabel={t("simulatedDemoValue")}
            />
            <StatCard
              label={t("potentiallyExposedSettlements")}
              value={scenario.simulatedStats.exposedSettlements}
              tone="warning"
              sublabel={t("simulatedDemoValue")}
            />
            <StatCard
              label={t("criticalInfrastructure")}
              value={scenario.simulatedStats.criticalInfrastructure}
              tone="warning"
              sublabel={t("simulatedDemoValue")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
