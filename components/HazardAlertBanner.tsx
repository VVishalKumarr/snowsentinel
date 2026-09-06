"use client";

// HazardAlertBanner — the in-app popup shown when a new hazard alert is
// detected (see HazardAlertContext's dedupe logic). Distinct from
// FamilySosAlertOverlay (that's a person-triggered emergency; this is the
// automated risk-level system) — see NOTIFICATION PRIORITY in the spec.

import { useRouter } from "next/navigation";
import { TriangleAlert, X, VolumeX } from "lucide-react";
import { useHazardAlert } from "@/lib/HazardAlertContext";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { ALERT_LEVEL_LABEL_KEY, ALERT_LEVEL_MESSAGE_KEY, ALERT_LEVEL_EMOJI, ALERT_LEVEL_COLORS, ALERT_LEVEL_RANK } from "@/lib/alertLevels";

export default function HazardAlertBanner() {
  const { user } = useAuth();
  const { bannerAlert, dismissBannerAlert, muteSound } = useHazardAlert();
  const { t } = useLanguage();
  const router = useRouter();

  if (!user || !bannerAlert) return null;
  const colors = ALERT_LEVEL_COLORS[bannerAlert.level];
  const messageKey = ALERT_LEVEL_MESSAGE_KEY[bannerAlert.level];
  const hasSound = ALERT_LEVEL_RANK[bannerAlert.level] >= ALERT_LEVEL_RANK.HIGH;

  return (
    <div className="fixed inset-x-0 top-16 z-[1200] flex justify-center px-4">
      <div className={`w-full max-w-md rounded-2xl border-2 ${colors.border} ${colors.bg} p-4 shadow-lg`}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className={`flex items-center gap-2 text-sm font-bold ${colors.text}`}>
            <TriangleAlert className="h-4 w-4 flex-shrink-0" />
            {ALERT_LEVEL_EMOJI[bannerAlert.level]} {t(ALERT_LEVEL_LABEL_KEY[bannerAlert.level])} {t("alertWord")}
          </div>
          <button onClick={dismissBannerAlert} aria-label={t("commonDismiss")} className="flex-shrink-0 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className={`mb-3 text-sm ${colors.text}`}>{messageKey ? t(messageKey) : ""}</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              dismissBannerAlert();
              router.push("/dashboard?tab=impact");
            }}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
          >
            {t("viewImpactMapButton")}
          </button>
          <button
            onClick={() => {
              dismissBannerAlert();
              router.push("/dashboard?tab=shelters");
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("findNearbyShelterButton")}
          </button>
          {hasSound && (
            <button
              onClick={muteSound}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <VolumeX className="h-3.5 w-3.5" /> {t("muteAlertButton")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
