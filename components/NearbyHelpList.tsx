"use client";

import { useState } from "react";
import { Hospital, Shield, Flame, Building2, PhoneCall, Navigation } from "lucide-react";
import { EMERGENCY_SERVICES, DEMO_SYNC_TIME } from "@/lib/emergencyData";
import type { EmergencyServiceType } from "@/lib/emergencyTypes";

const TYPE_META: Record<EmergencyServiceType, { label: string; icon: typeof Hospital; emoji: string }> = {
  hospital: { label: "Hospital", icon: Hospital, emoji: "🏥" },
  police: { label: "Police", icon: Shield, emoji: "👮" },
  fire: { label: "Fire Brigade", icon: Flame, emoji: "🚒" },
  ambulance: { label: "Ambulance Service", icon: Building2, emoji: "🚑" },
  response_center: { label: "Response Center", icon: Building2, emoji: "🏢" },
};

const FILTERS: { id: EmergencyServiceType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "hospital", label: "🏥 Hospitals" },
  { id: "police", label: "👮 Police" },
  { id: "fire", label: "🚒 Fire" },
  { id: "response_center", label: "🏢 Response Centers" },
];

function directionsUrl(position: [number, number]) {
  return `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;
}

export default function NearbyHelpList() {
  const [filter, setFilter] = useState<EmergencyServiceType | "all">("all");

  const services = EMERGENCY_SERVICES.filter((s) => filter === "all" || s.type === filter).sort(
    (a, b) => a.distanceKm - b.distanceKm
  );

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">NEARBY HELP</h2>
        <span className="text-[10px] text-slate-400">Last sync: {DEMO_SYNC_TIME}</span>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Demo/seeded locations for this prototype region. Architected to accept a live places or dispatch
        API — see <code className="rounded bg-slate-100 px-1 py-0.5">lib/emergencyData.ts</code>.
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
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {services.map((s) => {
          const meta = TYPE_META[s.type];
          return (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <span>{meta.emoji}</span> {s.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span>{meta.label}</span>
                    <span>·</span>
                    <span className="font-mono">{s.distanceKm} km</span>
                    {s.status && (
                      <>
                        <span>·</span>
                        <span>{s.status}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {s.phone ? (
                    <a
                      href={`tel:${s.phone}`}
                      className="flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700"
                    >
                      <PhoneCall className="h-3 w-3" /> CALL
                    </a>
                  ) : (
                    <span className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-400">
                      Use helpline
                    </span>
                  )}
                  <a
                    href={directionsUrl(s.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Navigation className="h-3 w-3" /> DIRECTIONS
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
