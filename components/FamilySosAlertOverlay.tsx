"use client";

// FamilySosAlertOverlay — the prominent, dismissible in-app banner that
// appears when a NEW family SOS arrives while the app is open (see
// NotificationContext's "seenSosIds" logic for what counts as new). Mounted
// once at the root layout so it can appear regardless of which page/tab the
// user is on, but renders nothing when there's nothing to show.

import { useRouter } from "next/navigation";
import { Siren, X, MapPin } from "lucide-react";
import { useNotifications } from "@/lib/NotificationContext";
import { useLanguage } from "@/lib/i18n";

export default function FamilySosAlertOverlay() {
  const { activeSosAlert, acknowledgeSos, markSosRead, dismissActiveSosAlert } = useNotifications();
  const { t } = useLanguage();
  const router = useRouter();

  if (!activeSosAlert) return null;

  const handleView = () => {
    markSosRead(activeSosAlert.id);
    dismissActiveSosAlert();
    router.push("/dashboard?tab=family");
  };

  const handleAcknowledge = () => {
    acknowledgeSos(activeSosAlert.id);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[1300] flex justify-center px-4 pt-3">
      <div className="w-full max-w-md rounded-2xl border-2 border-red-400 bg-red-50 p-4 shadow-lg">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-red-800">
            <Siren className="h-4 w-4 flex-shrink-0" />
            {t("emergencyFamilySosBannerTitle")}
          </div>
          <button
            onClick={dismissActiveSosAlert}
            aria-label={t("commonDismiss")}
            className="flex-shrink-0 text-red-400 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-sm text-red-700">
          {t("sosActivatedMessage", { name: activeSosAlert.senderName })} {t("sosMayNeedImmediateAssistance")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleView}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            <MapPin className="h-3.5 w-3.5" /> {t("viewSos")}
          </button>
          <button
            onClick={handleAcknowledge}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            {t("alertAcknowledge")}
          </button>
        </div>
      </div>
    </div>
  );
}
