"use client";

import { Wifi, WifiOff, TriangleAlert, RefreshCw } from "lucide-react";
import { useAppState } from "@/lib/AppStateContext";

const CONFIG = {
  ONLINE: { label: "ONLINE", icon: Wifi, className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  LIMITED: { label: "LIMITED CONNECTION", icon: TriangleAlert, className: "border-amber-300 bg-amber-50 text-amber-700" },
  OFFLINE: { label: "OFFLINE", icon: WifiOff, className: "border-red-300 bg-red-50 text-red-700" },
} as const;

export default function ConnectionIndicator() {
  const { connection, syncing } = useAppState();
  const cfg = CONFIG[connection];
  const Icon = cfg.icon;

  if (syncing) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-teal-300 bg-teal-50 px-3 py-1">
        <RefreshCw className="h-3 w-3 animate-spin text-teal-700" strokeWidth={2} />
        <span className="text-[10px] font-medium tracking-[0.12em] text-teal-700">SYNCING</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1 ${cfg.className}`}>
      <Icon className="h-3 w-3" strokeWidth={2} />
      <span className="text-[10px] font-medium tracking-[0.12em]">{cfg.label}</span>
    </div>
  );
}
