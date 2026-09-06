"use client";

import { Wifi, WifiOff, TriangleAlert, RefreshCw } from "lucide-react";
import { useAppState } from "@/lib/AppStateContext";
import { useLanguage } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

const CONFIG = {
  ONLINE: { labelKey: "online" as TranslationKey, icon: Wifi, className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  LIMITED: { labelKey: "limitedConnection" as TranslationKey, icon: TriangleAlert, className: "border-amber-300 bg-amber-50 text-amber-700" },
  OFFLINE: { labelKey: "offline" as TranslationKey, icon: WifiOff, className: "border-red-300 bg-red-50 text-red-700" },
} as const;

export default function ConnectionIndicator() {
  const { connection, syncing } = useAppState();
  const { t } = useLanguage();
  const cfg = CONFIG[connection];
  const Icon = cfg.icon;

  if (syncing) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-50 px-2 py-1 sm:gap-2 sm:px-3">
        <RefreshCw className="h-3 w-3 flex-shrink-0 animate-spin text-teal-700" strokeWidth={2} />
        <span className="hidden text-[10px] font-medium tracking-[0.12em] text-teal-700 sm:inline">{t("syncing")}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-2 py-1 sm:gap-2 sm:px-3 ${cfg.className}`}>
      <Icon className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
      <span className="hidden text-[10px] font-medium tracking-[0.12em] sm:inline">{t(cfg.labelKey)}</span>
    </div>
  );
}
