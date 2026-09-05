"use client";

import { useCallback, useRef, useState } from "react";
import { Siren, Share2, PhoneCall, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAppState } from "@/lib/AppStateContext";
import { emergencyContacts, telHref } from "@/lib/emergencyContacts.config";

const HOLD_MS = 2000;

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

export default function SOSButton({ compact = false }: { compact?: boolean }) {
  const { trustedContacts, familyMembers, submitSOS, sosQueue } = useAppState();
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastRequest = sosQueue.find((r) => r.id === lastRequestId) ?? null;
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const recipients =
    trustedContacts.length > 0
      ? trustedContacts.map((c) => ({ id: c.id, name: c.name }))
      : familyMembers.filter((f) => f.relationship !== "You").map((f) => ({ id: f.id, name: f.name }));

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setHolding(false);
    setHoldProgress(0);
  }, []);

  const completeSOS = useCallback(async () => {
    cancelHold();
    setSending(true);
    setError(null);
    try {
      const location = await getLocation();
      const request = submitSOS(
        recipients.map((r) => r.id),
        location
      );
      setLastRequestId(request.id);

      if (request.status === "SENT" && typeof navigator !== "undefined" && "share" in navigator) {
        try {
          await navigator.share({ title: "SOS Alert", text: request.message });
        } catch {
          // user cancelled share sheet — the request itself is still recorded as SENT/QUEUED
        }
      }
    } catch {
      setError("Could not process SOS on this device. Use the emergency call button below.");
    } finally {
      setSending(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelHold, submitSOS]);

  const startHold = useCallback(() => {
    if (sending) return;
    setHolding(true);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(1, (now - startRef.current) / HOLD_MS);
      setHoldProgress(pct);
      if (pct >= 1) {
        completeSOS();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [sending, completeSOS]);

  const emergencyNumber = emergencyContacts.find((c) => c.category === "Emergency")?.number ?? "";
  const emergencyTel = telHref(emergencyNumber);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center text-xs text-slate-500">
        {recipients.length > 0 ? (
          <>
            Alert will be sent to:{" "}
            <span className="font-medium text-slate-700">{recipients.map((r) => r.name).join(", ")}</span>
          </>
        ) : (
          <span className="text-amber-700">No trusted contacts set — add one in Family Safety first.</span>
        )}
      </div>

      <button
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        disabled={sending}
        className={`relative flex select-none flex-col items-center justify-center rounded-full border-4 border-red-700 bg-red-600 text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60 ${
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
        <span className={`mt-1 font-bold tracking-wide ${compact ? "text-[10px]" : "text-sm"}`}>SOS</span>
        {!compact && <span className="text-[9px] tracking-wide opacity-90">HOLD 2 SEC</span>}
      </button>

      <p className="text-[11px] text-slate-500">
        {sending ? "Sending…" : "Hold for 2 seconds to send SOS."}
      </p>

      {lastRequest && (
        <div
          className={`w-full max-w-sm rounded-xl border p-3 text-xs ${
            lastRequest.status === "SENT"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : lastRequest.status === "QUEUED"
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {lastRequest.status === "SENT" && <CheckCircle2 className="h-3.5 w-3.5" />}
            {lastRequest.status === "QUEUED" && <Clock className="h-3.5 w-3.5" />}
            {lastRequest.status === "FAILED" && <XCircle className="h-3.5 w-3.5" />}
            {lastRequest.status === "SENT" && "SOS SENT"}
            {lastRequest.status === "QUEUED" && "SOS QUEUED — WILL SEND WHEN CONNECTION RETURNS"}
            {lastRequest.status === "FAILED" && "SOS FAILED"}
          </div>
          {lastRequest.status === "QUEUED" && (
            <p className="mt-1">
              Saved on this device. It has not been delivered yet — no message has left this phone.
            </p>
          )}
          <pre className="mt-2 whitespace-pre-wrap rounded bg-white/60 p-2 font-sans text-[11px]">
            {lastRequest.message}
          </pre>
          {typeof navigator !== "undefined" && !("share" in navigator) && (
            <p className="mt-2 text-[10px]">
              Automatic sharing isn&apos;t supported in this browser — copy the message above and send it
              manually, or use the call button below.
            </p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {emergencyTel ? (
        <a
          href={emergencyTel}
          className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          <PhoneCall className="h-3.5 w-3.5" /> Call Emergency Services
        </a>
      ) : (
        <span className="text-[10px] text-slate-400">
          Emergency number not configured — see lib/emergencyContacts.config.ts
        </span>
      )}

      {typeof navigator !== "undefined" && "share" in navigator && lastRequest && (
        <button
          onClick={() => navigator.share({ title: "SOS Alert", text: lastRequest.message }).catch(() => {})}
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-700"
        >
          <Share2 className="h-3 w-3" /> Share SOS message again
        </button>
      )}
    </div>
  );
}
