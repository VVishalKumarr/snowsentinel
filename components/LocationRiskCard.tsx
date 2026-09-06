"use client";

import { useRouter } from "next/navigation";
import { MapPinned, Navigation } from "lucide-react";
import { useHazardAlert } from "@/lib/HazardAlertContext";
import { useLanguage } from "@/lib/i18n";
import { ZONE_LABEL_KEY, ZONE_EMOJI } from "@/lib/locationAlert";
import { useCountdown, formatCountdown } from "@/lib/useCountdown";

export default function LocationRiskCard() {
  const { locationPermission, locationZone, distanceKm, requestLocation, countdownTargetMs } = useHazardAlert();
  const { remainingMs, reached } = useCountdown(countdownTargetMs);
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-800">
        <MapPinned className="h-4 w-4 text-teal-600" /> {t("yourLocationLabel")}
      </div>
      <p className="mb-3 text-xs text-slate-500">{t("locationAlertPermissionExplain")}</p>

      {locationPermission === "unsupported" ? (
        <p className="text-xs text-slate-400">{t("locationPermissionDeniedNote")}</p>
      ) : locationZone === null ? (
        <div>
          {locationPermission === "denied" && <p className="mb-2 text-xs text-amber-600">{t("locationPermissionDeniedNote")}</p>}
          <button
            onClick={requestLocation}
            className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
          >
            {t("enableLocationButton")}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-lg font-bold">
            {ZONE_EMOJI[locationZone]} {t(ZONE_LABEL_KEY[locationZone])}
          </div>
          {distanceKm != null && (
            <div className="text-xs text-slate-500">
              {t("distance")}: <span className="font-mono text-slate-700">{distanceKm.toFixed(1)} km</span>
            </div>
          )}
          {locationZone !== "SAFE" && (
            <>
              <div className="text-xs text-slate-500">
                {t("estimatedArrivalLabel")}:{" "}
                <span className="font-mono text-slate-700">
                  {countdownTargetMs == null
                    ? t("arrivalTimeUnavailable")
                    : reached
                    ? t("hazardArrivalWindowReached")
                    : remainingMs != null
                    ? formatCountdown(remainingMs)
                    : "--:--:--"}
                </span>
              </div>
              <p className="text-xs text-slate-600">{t("recommendedActionMoveSafe")}</p>
            </>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => router.push("/dashboard?tab=impact")}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
            >
              <Navigation className="h-3.5 w-3.5" /> {t("viewImpactMapButton")}
            </button>
            <button
              onClick={() => router.push("/dashboard?tab=shelters")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("findNearbyShelterButton")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
