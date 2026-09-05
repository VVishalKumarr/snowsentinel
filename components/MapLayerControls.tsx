"use client";

import type { MapLayerToggles } from "@/lib/mapLayers";

const LAYER_LABELS: { key: keyof MapLayerToggles; label: string }[] = [
  { key: "hazard", label: "Hazard zone" },
  { key: "priority", label: "Priority zones" },
  { key: "shelters", label: "Shelters" },
  { key: "hospitals", label: "Hospitals" },
  { key: "police", label: "Police" },
  { key: "fire", label: "Fire brigade" },
  { key: "ambulances", label: "Ambulances" },
  { key: "safeZones", label: "Safe zones" },
  { key: "roads", label: "Roads" },
];

export default function MapLayerControls({
  layers,
  onChange,
}: {
  layers: MapLayerToggles;
  onChange: (next: MapLayerToggles) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {LAYER_LABELS.map(({ key, label }) => (
        <label key={key} className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={(e) => onChange({ ...layers, [key]: e.target.checked })}
            className="h-3.5 w-3.5 accent-teal-600"
          />
          {label}
        </label>
      ))}
    </div>
  );
}
