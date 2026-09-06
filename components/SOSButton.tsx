"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Siren,
  PhoneCall,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Users2,
  MessageCircle,
  MessageSquareText,
  Share2,
} from "lucide-react";
import { useAppState } from "@/lib/AppStateContext";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { useNotifications } from "@/lib/NotificationContext";
import { emergencyContacts, telHref } from "@/lib/emergencyContacts.config";
import { isNativeSmsAvailable, sendNativeSms, buildSmsComposeHref, cleanPhoneNumber } from "@/lib/nativeSms";

const HOLD_MS = 2000;

interface Recipient {
  id: string;
  name: string;
  phoneNumber?: string;
  // Only set for real, logged-in family-network connections — lets the
  // Family Network share channel notify them through the app itself.
  userId?: number;
}

type FlowStep = "idle" | "locating" | "confirm" | "result";
type ShareChannel = "family" | "whatsapp" | "sms" | "other";
type ResultStatus = "SHARED" | "QUEUED" | "CANCELLED";

function getLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    const timeout = setTimeout(() => resolve(null), 6000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timeout);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 5500 }
    );
  });
}

function buildMessage(
  location: { lat: number; lng: number } | null,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
): string {
  const mapsLink = location
    ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    : t("sosMessageLocationUnavailable");
  return [
    t("sosMessageAlert"),
    "",
    t("sosMessageLocationLabel"),
    mapsLink,
    "",
    t("sosMessageFooter"),
  ].join("\n");
}

export default function SOSButton({ compact = false }: { compact?: boolean }) {
  const { trustedContacts, familyMembers, submitSOS } = useAppState();
  const { user, authedFetch } = useAuth();
  const { t } = useLanguage();
  const { refresh: refreshNotifications } = useNotifications();

  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [step, setStep] = useState<FlowStep>("idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ status: ResultStatus; channel: ShareChannel | null } | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // Prefer the real, cross-device family network when logged in; otherwise
  // fall back to the local trusted-contacts list so SOS still works without
  // an account.
  useEffect(() => {
    let cancelled = false;
    async function loadRecipients() {
      if (user) {
        try {
          const res = await authedFetch("/api/family");
          const data = await res.json();
          if (!cancelled) {
            const list: Recipient[] = (data.members ?? []).map(
              (m: { userId: number; name: string; phoneNumber: string | null }) => ({
                id: String(m.userId),
                name: m.name,
                phoneNumber: m.phoneNumber ?? undefined,
                userId: m.userId,
              })
            );
            setRecipients(list);
            setSelected(new Set(list.map((r) => r.id)));
          }
          return;
        } catch {
          // fall through to local fallback
        }
      }
      const local: Recipient[] =
        trustedContacts.length > 0
          ? trustedContacts.map((c) => ({ id: c.id, name: c.name, phoneNumber: c.contactMethod }))
          : familyMembers
              .filter((f) => f.relationship !== "You")
              .map((f) => ({ id: f.id, name: f.name, phoneNumber: f.contactMethod }));
      if (!cancelled) {
        setRecipients(local);
        setSelected(new Set(local.map((r) => r.id)));
      }
    }
    loadRecipients();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setHolding(false);
    setHoldProgress(0);
  }, []);

  const beginFlow = useCallback(async () => {
    cancelHold();
    setStep("locating");
    const loc = await getLocation();
    setLocation(loc);
    setStep("confirm");
  }, [cancelHold]);

  const startHold = useCallback(() => {
    if (step !== "idle") return;
    setHolding(true);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(1, (now - startRef.current) / HOLD_MS);
      setHoldProgress(pct);
      if (pct >= 1) {
        beginFlow();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [step, beginFlow]);

  const toggleRecipient = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const finish = (status: ResultStatus, channel: ShareChannel | null) => {
    setResult({ status, channel });
    setStep("result");
  };

  const shareVia = async (channel: ShareChannel) => {
    const message = buildMessage(location, t);
    const chosen = recipients.filter((r) => selected.has(r.id));
    const numbers = chosen.map((r) => cleanPhoneNumber(r.phoneNumber ?? "")).filter((n): n is string => !!n);
    const recipientUserIds = chosen.map((r) => r.userId).filter((id): id is number => typeof id === "number");

    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    // Record the event locally regardless of channel — this is the local
    // audit trail, not the delivery. The "family" channel persists its own
    // canonical server-side record (with recipients) below via
    // /api/sos/family, so it skips this generic /api/sos call to avoid
    // creating two separate sos_requests rows for one SOS action.
    const record = submitSOS(
      chosen.map((r) => r.id),
      location,
      channel === "family" ? recipientUserIds : undefined
    );
    if (user && channel !== "family") {
      authedFetch("/api/sos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lat: location?.lat, lng: location?.lng, message, status: record.status }),
      }).catch(() => {});
    }

    if (isOffline) {
      finish("QUEUED", channel);
      return;
    }

    try {
      if (channel === "family") {
        if (!user || recipientUserIds.length === 0) {
          finish("CANCELLED", channel);
          return;
        }
        const res = await authedFetch("/api/sos/family", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ recipientUserIds, message, lat: location?.lat, lng: location?.lng }),
        });
        if (res.ok) refreshNotifications();
        finish(res.ok ? "SHARED" : "CANCELLED", channel);
        return;
      }

      if (channel === "whatsapp") {
        const url =
          numbers.length === 1
            ? `https://wa.me/${numbers[0].replace(/^\+/, "")}?text=${encodeURIComponent(message)}`
            : `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        finish("SHARED", channel);
        return;
      }

      if (channel === "sms") {
        if (numbers.length > 0 && isNativeSmsAvailable()) {
          let delivered = 0;
          for (const num of numbers) {
            if (await sendNativeSms(num, message)) delivered++;
          }
          finish(delivered > 0 ? "SHARED" : "CANCELLED", channel);
          return;
        }
        if (numbers.length > 0) {
          window.location.href = buildSmsComposeHref(numbers, message);
          finish("SHARED", channel);
          return;
        }
      }

      // "Share" — generic OS share sheet (Instagram/Facebook/Messages/etc.
      // appear here if installed and able to accept shared text; a website
      // cannot pre-fill a private message in those apps directly, which is
      // a real platform restriction, not a bug).
      const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
      if (canShare) {
        try {
          await navigator.share({ title: t("sosShareTitle"), text: message });
          finish("SHARED", channel);
        } catch {
          finish("CANCELLED", channel);
        }
        return;
      }

      const canCopy = typeof navigator !== "undefined" && !!navigator.clipboard;
      if (canCopy) {
        await navigator.clipboard.writeText(message);
      }
      finish("SHARED", channel);
    } catch {
      finish("CANCELLED", channel);
    }
  };

  const reset = () => {
    setStep("idle");
    setResult(null);
    setLocation(null);
  };

  const emergencyNumber = emergencyContacts.find((c) => c.category === "Emergency")?.number ?? "";
  const emergencyTel = telHref(emergencyNumber);

  if (step === "locating") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
        <p className="text-xs text-slate-500">{t("sosGettingLocation")}</p>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">🚨 {t("sos")}</div>
          <p className="mt-1 text-xs text-slate-600">{t("sosConfirmDescription")}</p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
          <span className="font-mono text-slate-700">
            {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : t("sosLocationUnavailable")}
          </span>
        </div>

        {recipients.length > 0 ? (
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-slate-500">{t("sosWhoShouldReceive")}</div>
            {recipients.map((r) => (
              <label key={r.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggleRecipient(r.id)}
                  className="h-4 w-4 accent-red-600"
                />
                {r.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-amber-700">{t("sosNoContacts")}</p>
        )}

        <div>
          <div className="mb-1.5 text-[11px] font-medium text-slate-500">{t("sosShareVia")}</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => shareVia("family")}
              disabled={!user}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-40"
            >
              <Users2 className="h-3.5 w-3.5" /> {t("sosShareFamilyNetwork")}
            </button>
            <button
              onClick={() => shareVia("whatsapp")}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" /> {t("sosShareWhatsApp")}
            </button>
            <button
              onClick={() => shareVia("sms")}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <MessageSquareText className="h-3.5 w-3.5" /> {t("sosShareSms")}
            </button>
            <button
              onClick={() => shareVia("other")}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="h-3.5 w-3.5" /> {t("sosShareOther")}
            </button>
          </div>
          {!user && (
            <p className="mt-1.5 text-[10px] text-slate-400">{t("sosLogInForFamily")}</p>
          )}
        </div>

        <button onClick={reset} className="w-full text-center text-xs text-slate-400 hover:text-slate-600">
          {t("sosCancel")}
        </button>
      </div>
    );
  }

  if (step === "result" && result) {
    const message = buildMessage(location, t);
    return (
      <div className="w-full max-w-sm space-y-3 text-center">
        <div
          className={`flex items-center justify-center gap-1.5 rounded-xl border p-3 text-sm font-semibold ${
            result.status === "SHARED"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : result.status === "QUEUED"
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-slate-300 bg-slate-100 text-slate-600"
          }`}
        >
          {result.status === "SHARED" && <CheckCircle2 className="h-4 w-4" />}
          {result.status === "QUEUED" && <Clock className="h-4 w-4" />}
          {result.status === "CANCELLED" && <XCircle className="h-4 w-4" />}
          {result.status === "SHARED" && (result.channel === "family" ? t("sosSentToFamily") : t("sosShared"))}
          {result.status === "QUEUED" && `${t("sosQueued")}`}
          {result.status === "CANCELLED" && t("sosSharingCancelled")}
        </div>
        {result.status === "QUEUED" && (
          <p className="text-xs text-slate-500">{t("sosQueuedNote")}</p>
        )}
        <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-left font-sans text-[11px] text-slate-600">
          {message}
        </pre>
        {emergencyTel && (
          <a
            href={emergencyTel}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <PhoneCall className="h-3.5 w-3.5" /> {t("call")}
          </a>
        )}
        <button
          onClick={reset}
          className="w-full rounded-lg border border-slate-300 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {t("commonDone")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center text-xs text-slate-500">
        {recipients.length > 0 ? (
          <>
            {t("sosRecipients")}{" "}
            <span className="font-medium text-slate-700">{recipients.map((r) => r.name).join(", ")}</span>
          </>
        ) : (
          <span className="text-amber-700">{t("sosNoContacts")}</span>
        )}
      </div>

      <button
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        className={`relative flex select-none flex-col items-center justify-center rounded-full border-4 border-red-700 bg-red-600 text-white shadow-lg transition-transform active:scale-95 ${
          compact ? "h-20 w-20" : "h-36 w-36"
        } ${holding ? "" : "sos-pulse"}`}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={2 * Math.PI * 46 * (1 - holdProgress)}
            strokeLinecap="round"
          />
        </svg>
        <Siren className={compact ? "h-6 w-6" : "h-9 w-9"} strokeWidth={2} />
        <span className={`mt-1 font-bold tracking-wide ${compact ? "text-[10px]" : "text-sm"}`}>{t("sos")}</span>
        {!compact && <span className="text-[9px] tracking-wide opacity-90">{t("sosHold")}</span>}
      </button>

      <p className="text-[11px] text-slate-500">{t("sosHoldInstruction")}</p>

      {emergencyTel ? (
        <a
          href={emergencyTel}
          className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          <PhoneCall className="h-3.5 w-3.5" /> {t("call")}
        </a>
      ) : (
        <span className="text-[10px] text-slate-400">{t("emergencyNotConfigured")}</span>
      )}
    </div>
  );
}
