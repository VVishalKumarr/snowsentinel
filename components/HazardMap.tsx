"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { HazardScenario, Settlement, Infrastructure } from "@/lib/types";
import type { Shelter, EmergencyService, Ambulance, AmbulanceStatus } from "@/lib/emergencyTypes";
import type { TranslationKey } from "@/lib/i18n/en";
import { buildPriorityZones } from "@/lib/emergencyData";
import { DEFAULT_LAYERS, type MapLayerToggles } from "@/lib/mapLayers";
import { useLanguage } from "@/lib/i18n";
import { getCrowdDensityForScenario, CROWD_DENSITY_LABEL_KEY, CROWD_DENSITY_EMOJI, type CrowdDensity } from "@/lib/crowdDensity";

const CROWD_DENSITY_COLOR: Record<CrowdDensity, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  HIGH: "#f97316",
  VERY_HIGH: "#dc2626",
};

const CROWD_DENSITY_RADIUS: Record<CrowdDensity, number> = {
  LOW: 12,
  MODERATE: 18,
  HIGH: 26,
  VERY_HIGH: 34,
};

const INFRA_EMOJI: Record<Infrastructure["type"], string> = {
  road: "🛣️",
  bridge: "🌉",
  medical: "🏥",
  school: "🏫",
};

const SERVICE_EMOJI: Record<EmergencyService["type"], string> = {
  hospital: "🏥",
  police: "👮",
  fire: "🚒",
  ambulance: "🚑",
  response_center: "🏢",
};

const PRIORITY_COLOR: Record<number, string> = {
  1: "#dc2626",
  2: "#f97316",
  3: "#eab308",
  4: "#16a34a",
};

const AMBULANCE_STATUS_LABEL_KEY: Record<AmbulanceStatus, TranslationKey> = {
  AVAILABLE: "ambulanceStatusAvailable",
  EN_ROUTE: "ambulanceStatusEnRoute",
  UNAVAILABLE: "ambulanceStatusUnavailable",
};

function googleMapsUrl(position: [number, number]): string {
  return `https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`;
}

function MapsLink({ position }: { position: [number, number] }) {
  const { t } = useLanguage();
  return (
    <a
      href={googleMapsUrl(position)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 inline-block rounded bg-teal-600 px-2 py-1 text-[11px] font-semibold text-white no-underline hover:bg-teal-700"
    >
      {t("openInGoogleMaps")}
    </a>
  );
}

function emojiIcon(emoji: string, size = 26) {
  return L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.35))">${emoji}</div>`,
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
  layers?: MapLayerToggles;
  shelters?: Shelter[];
  services?: EmergencyService[];
  ambulances?: Ambulance[];
}

export default function HazardMap({
  scenario,
  simulateTrigger,
  onSelectSettlement,
  selectedSettlementId,
  onSimulationComplete,
  layers = DEFAULT_LAYERS,
  shelters = [],
  services = [],
  ambulances = [],
}: HazardMapProps) {
  const { t } = useLanguage();
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
  const priorityZones = buildPriorityZones(scenario, t);
  const crowdDensity = getCrowdDensityForScenario(scenario);

  return (
    <MapContainer center={scenario.region.center} zoom={12} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {layers.hazard &&
        scenario.impactZones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.positions}
            pathOptions={{ color: zone.color, weight: 1, fillColor: zone.color, fillOpacity: 0.15 }}
          />
        ))}

      {layers.hazard && (
        <Polyline
          positions={scenario.impactPath}
          pathOptions={{ color: "#94a3b8", weight: 2, opacity: 0.5, dashArray: "4 6" }}
        />
      )}

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
          pathOptions={{ color: "#0f766e", weight: 2, fillOpacity: 0, dashArray: "3 4" }}
        />
      )}

      {layers.priority &&
        priorityZones.map((pz) => {
          const settlement = scenario.settlements.find((s) => s.id === pz.settlementId);
          if (!settlement) return null;
          return (
            <CircleMarker
              key={pz.id}
              center={settlement.position}
              radius={22}
              pathOptions={{
                color: PRIORITY_COLOR[pz.level],
                weight: 2,
                fillColor: PRIORITY_COLOR[pz.level],
                fillOpacity: 0.12,
              }}
            />
          );
        })}

      {layers.crowd &&
        crowdDensity.map((c) => {
          const settlement = scenario.settlements.find((s) => s.id === c.settlementId);
          if (!settlement) return null;
          return (
            <CircleMarker
              key={`crowd-${c.settlementId}`}
              center={settlement.position}
              radius={CROWD_DENSITY_RADIUS[c.density]}
              pathOptions={{
                color: CROWD_DENSITY_COLOR[c.density],
                weight: 1,
                fillColor: CROWD_DENSITY_COLOR[c.density],
                fillOpacity: 0.25,
              }}
            >
              <Popup>
                <strong>{settlement.name}</strong>
                <br />
                {t("estimatedPeopleLabel")}: {c.estimatedPeople.toLocaleString()}
                <br />
                {t("crowdDensityFieldLabel")}: {CROWD_DENSITY_EMOJI[c.density]} {t(CROWD_DENSITY_LABEL_KEY[c.density])}
                <br />
                <span className="text-[10px] text-slate-500">{t("demoCrowdDataBadge")}</span>
              </Popup>
            </CircleMarker>
          );
        })}

      <Marker position={scenario.impactPath[0]} icon={emojiIcon("🏔️", 30)}>
        <Popup>
          {t("mapMountainSourceZone")}
          <br />
          <MapsLink position={scenario.impactPath[0]} />
        </Popup>
      </Marker>

      {scenario.settlements.map((s) => (
        <Marker
          key={s.id}
          position={s.position}
          icon={emojiIcon("🏠", 24)}
          eventHandlers={{ click: () => onSelectSettlement(s) }}
        >
          <Popup>
            <strong>{s.name}</strong>
            <br />
            <MapsLink position={s.position} />
          </Popup>
        </Marker>
      ))}

      {scenario.infrastructure
        .filter((infra) => {
          if (infra.type === "road" || infra.type === "bridge") return layers.roads;
          if (infra.type === "medical") return layers.hospitals;
          if (infra.type === "school") return layers.safeZones;
          return true;
        })
        .map((infra) => (
          <Marker key={infra.id} position={infra.position} icon={emojiIcon(INFRA_EMOJI[infra.type], 20)}>
            <Popup>
              {infra.name}
              <br />
              <MapsLink position={infra.position} />
            </Popup>
          </Marker>
        ))}

      {layers.shelters &&
        shelters.map((sh) => (
          <Marker key={sh.id} position={sh.position} icon={emojiIcon(sh.isOpen ? "⛺" : "🚫", 22)}>
            <Popup>
              <strong>{sh.name}</strong>
              <br />
              {sh.isOpen ? t("mapSpacesAvailable", { count: sh.capacity - sh.occupied }) : t("mapCurrentlyClosed")}
              <br />
              <MapsLink position={sh.position} />
            </Popup>
          </Marker>
        ))}

      {layers.safeZones &&
        shelters
          .filter((sh) => sh.isOpen)
          .map((sh) => (
            <Marker key={`safe-${sh.id}`} position={sh.position} icon={emojiIcon("🟢", 16)} />
          ))}

      {layers.hospitals &&
        services
          .filter((s) => s.type === "hospital")
          .map((s) => (
            <Marker key={s.id} position={s.position} icon={emojiIcon(SERVICE_EMOJI.hospital, 22)}>
              <Popup>
                {s.name}
                <br />
                <MapsLink position={s.position} />
              </Popup>
            </Marker>
          ))}

      {layers.police &&
        services
          .filter((s) => s.type === "police")
          .map((s) => (
            <Marker key={s.id} position={s.position} icon={emojiIcon(SERVICE_EMOJI.police, 22)}>
              <Popup>
                {s.name}
                <br />
                <MapsLink position={s.position} />
              </Popup>
            </Marker>
          ))}

      {layers.fire &&
        services
          .filter((s) => s.type === "fire")
          .map((s) => (
            <Marker key={s.id} position={s.position} icon={emojiIcon(SERVICE_EMOJI.fire, 22)}>
              <Popup>
                {s.name}
                <br />
                <MapsLink position={s.position} />
              </Popup>
            </Marker>
          ))}

      {layers.ambulances &&
        ambulances.map((a) => (
          <Marker key={a.id} position={a.position} icon={emojiIcon("🚑", 20)}>
            <Popup>
              {a.name} — {t(AMBULANCE_STATUS_LABEL_KEY[a.status])}
              <br />
              <MapsLink position={a.position} />
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
