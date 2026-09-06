"use client";

import type { MapLayerToggles } from "@/lib/mapLayers";
import type { TranslationKey } from "@/lib/i18n/en";
import { useLanguage } from "@/lib/i18n";

const LAYER_LABEL_KEYS: { key: keyof MapLayerToggles; labelKey: TranslationKey }[] = [
  { key: "hazard", labelKey: "layerHazardZone" },
  { key: "priority", labelKey: "layerPriorityZones" },
  { key: "shelters", labelKey: "layerShelters" },
  { key: "hospitals", labelKey: "layerHospitals" },
  { key: "police", labelKey: "layerPolice" },
  { key: "fire", labelKey: "layerFireBrigade" },
  { key: "ambulances", labelKey: "layerAmbulances" },
  { key: "safeZones", labelKey: "layerSafeZones" },
  { key: "roads", labelKey: "layerRoads" },
  { key: "crowd", labelKey: "filterCrowd" },
];

export default function MapLayerControls({
  layers,
  onChange,
}: {
  layers: MapLayerToggles;
  onChange: (next: MapLayerToggles) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {LAYER_LABEL_KEYS.map(({ key, labelKey }) => (
        <label key={key} className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={(e) => onChange({ ...layers, [key]: e.target.checked })}
            className="h-3.5 w-3.5 accent-teal-600"
          />
          {t(labelKey)}
        </label>
      ))}
    </div>
  );
}
