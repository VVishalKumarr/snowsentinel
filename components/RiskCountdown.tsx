"use client";

import { Timer } from "lucide-react";
import { useHazardAlert } from "@/lib/HazardAlertContext";
import { useCountdown, formatCountdown } from "@/lib/useCountdown";
import { useLanguage } from "@/lib/i18n";
import { ALERT_LEVEL_COLORS } from "@/lib/alertLevels";

export default function RiskCountdown() {
  const { countdownTargetMs, alertLevel, hazardTypeKey } = useHazardAlert();
  const { remainingMs, reached } = useCountdown(countdownTargetMs);
  const { t } = useLanguage();
  const colors = ALERT_LEVEL_COLORS[alertLevel];

  return (
    <div className={`rounded-xl border p-3 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-500">
          <Timer className="h-3.5 w-3.5" /> {t("riskCountdownTitle")}
        </div>
        <span className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-slate-500">
          {t("demoPredictionBadge")}
        </span>
      </div>
      <div className="mt-1 text-xs font-medium text-slate-600">{t(hazardTypeKey).toUpperCase()}</div>
      {countdownTargetMs == null ? (
        <div className="mt-1 text-sm text-slate-500">{t("arrivalTimeUnavailable")}</div>
      ) : reached ? (
        <div className={`mt-1 text-lg font-bold ${colors.text}`}>{t("hazardArrivalWindowReached")}</div>
      ) : (
        <div className={`mt-1 font-mono text-2xl font-bold tabular-nums ${colors.text}`}>
          {remainingMs != null ? formatCountdown(remainingMs) : "--:--:--"}
        </div>
      )}
    </div>
  );
}
