"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { HazardScenario, Settlement, Infrastructure } from "@/lib/types";

const INFRA_EMOJI: Record<Infrastructure["type"], string> = {
  road: "🛣️",
  bridge: "🌉",
  medical: "🏥",
  school: "🏫",
};

function emojiIcon(emoji: string, size = 26) {
  return L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.7))">${emoji}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function interpolatePath(path: [number, number][], t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const segments = path.length - 1;
  const scaled = clamped * segments;
  const segIndex = Math.min(segments - 1, Math.floor(scaled));
  const segT = scaled - segIndex;
  const [lat1, lng1] = path[segIndex];
  const [lat2, lng2] = path[segIndex + 1];
  const tip: [number, number] = [lat1 + (lat2 - lat1) * segT, lng1 + (lng2 - lng1) * segT];
  const drawn: [number, number][] = [...path.slice(0, segIndex + 1), tip];
  return { drawn, tip };
}

interface HazardMapProps {
  scenario: HazardScenario;
  simulateTrigger: number;
  onSelectSettlement: (s: Settlement | null) => void;
  selectedSettlementId: string | null;
  onSimulationComplete: () => void;
}

export default function HazardMap({
  scenario,
  simulateTrigger,
  onSelectSettlement,
  selectedSettlementId,
  onSimulationComplete,
}: HazardMapProps) {
  const [progress, setProgress] = useState(0);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    setProgress(0);
    setSimulating(false);
  }, [scenario.id]);

  useEffect(() => {
    if (simulateTrigger === 0) return;
    setSimulating(true);
    setProgress(0);
    const duration = 2600;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setProgress(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setSimulating(false);
        onSimulationComplete();
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulateTrigger]);

  const { drawn, tip } = interpolatePath(scenario.impactPath, progress);
  const selectedSettlement = scenario.settlements.find((s) => s.id === selectedSettlementId) ?? null;

  return (
    <MapContainer center={scenario.region.center} zoom={12} className="dark-tiles h-full w-full" scrollWheelZoom>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {scenario.impactZones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.positions}
          pathOptions={{ color: zone.color, weight: 1, fillColor: zone.color, fillOpacity: 0.15 }}
        />
      ))}

      <Polyline
        positions={scenario.impactPath}
        pathOptions={{ color: "#94a3b8", weight: 2, opacity: 0.35, dashArray: "4 6" }}
      />

      {(simulating || progress > 0) && (
        <Polyline positions={drawn} pathOptions={{ color: "#f97316", weight: 3, opacity: 0.9 }} />
      )}

      {simulating && (
        <CircleMarker
          center={tip}
          radius={7}
          pathOptions={{ color: "#f97316", fillColor: "#fb923c", fillOpacity: 1, weight: 2 }}
        />
      )}

      {selectedSettlement && (
        <CircleMarker
          center={selectedSettlement.position}
          radius={16}
          pathOptions={{ color: "#38bdf8", weight: 2, fillOpacity: 0, dashArray: "3 4" }}
        />
      )}

      <Marker position={scenario.impactPath[0]} icon={emojiIcon("🏔️", 30)}>
        <Popup>Mountain / source zone — demo marker</Popup>
      </Marker>

      {scenario.settlements.map((s) => (
        <Marker
          key={s.id}
          position={s.position}
          icon={emojiIcon("🏠", 24)}
          eventHandlers={{ click: () => onSelectSettlement(s) }}
        />
      ))}

      {scenario.infrastructure.map((infra) => (
        <Marker key={infra.id} position={infra.position} icon={emojiIcon(INFRA_EMOJI[infra.type], 20)}>
          <Popup>{infra.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
