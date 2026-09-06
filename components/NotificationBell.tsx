"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Siren, Clock3, UserPlus } from "lucide-react";
import { useNotifications } from "@/lib/NotificationContext";
import { useLanguage } from "@/lib/i18n";

function timeAgo(iso: string, t: (key: import("@/lib/i18n/en").TranslationKey, vars?: Record<string, string | number>) => string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return t("familyTimeJustNow");
  if (mins < 60) return t("familyTimeMinAgo", { count: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t("familyTimeHoursAgo", { count: hours });
  return t("familyTimeDaysAgo", { count: Math.round(hours / 24) });
}

export default function NotificationBell() {
  const { incomingSosAlerts, incomingCheckIns, pendingRequests, unreadCount, markSosRead } = useNotifications();
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadSos = incomingSosAlerts.filter((a) => a.status !== "ACKNOWLEDGED").slice(0, 5);
  const isEmpty = unreadSos.length === 0 && incomingCheckIns.length === 0 && pendingRequests.length === 0;

  const goToFamily = () => {
    setOpen(false);
    router.push("/dashboard?tab=family");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("notifBellAriaLabel")}
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold tracking-wide text-slate-700">
            {t("notificationsTitle")}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isEmpty && <p className="px-3 py-4 text-center text-xs text-slate-400">{t("notificationsEmpty")}</p>}

            {unreadSos.map((a) => (
              <button
                key={`sos-${a.id}`}
                onClick={() => {
                  markSosRead(a.id);
                  goToFamily();
                }}
                className="flex w-full items-start gap-2 border-b border-slate-50 px-3 py-2.5 text-left hover:bg-red-50"
              >
                <Siren className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-600" />
                <div>
                  <div className="text-xs font-semibold text-red-700">{t("sosAlertTitle")}</div>
                  <div className="text-xs text-slate-600">{t("sosActivatedMessage", { name: a.senderName })}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{timeAgo(a.createdAt, t)}</div>
                </div>
              </button>
            ))}

            {incomingCheckIns.map((c) => (
              <button
                key={`checkin-${c.connectionId}`}
                onClick={goToFamily}
                className="flex w-full items-start gap-2 border-b border-slate-50 px-3 py-2.5 text-left hover:bg-amber-50"
              >
                <Clock3 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                <div>
                  <div className="text-xs font-semibold text-amber-700">{t("notifCheckInRequestTitle")}</div>
                  <div className="text-xs text-slate-600">
                    <strong>{c.fromName}</strong> {t("familyCheckinRequestMessage")}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{timeAgo(c.requestedAt, t)}</div>
                </div>
              </button>
            ))}

            {pendingRequests.map((p) => (
              <button
                key={`req-${p.connectionId}`}
                onClick={goToFamily}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
              >
                <UserPlus className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-700">{t("notifFamilyRequestTitle")}</div>
                  <div className="text-xs text-slate-600">
                    @{p.fromUsername} {t("familyWantsToConnect")}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{timeAgo(p.createdAt, t)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
