"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock3,
  TriangleAlert,
  CircleDashed,
  Send,
  UserPlus,
  Check,
  X,
  Trash2,
  MapPin,
  PhoneCall,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import type { FamilyMemberView } from "@/lib/family";

const STATUS_LABEL_KEY: Record<FamilyMemberView["safetyStatus"], TranslationKey> = {
  SAFE: "familySafe",
  CHECK_IN_REQUESTED: "familyCheckInRequested",
  NEEDS_HELP: "familyNeedsHelp",
  NOT_CHECKED_IN: "familyNotCheckedIn",
};

interface PendingRequest {
  connectionId: number;
  fromUserId: number;
  fromName: string;
  fromCode: string;
  relationship: string | null;
  createdAt: string;
}

interface IncomingCheckIn {
  connectionId: number;
  fromUserId: number;
  fromName: string;
  requestedAt: string;
}

const STATUS_META: Record<
  FamilyMemberView["safetyStatus"],
  { icon: typeof ShieldCheck; className: string }
> = {
  SAFE: { icon: ShieldCheck, className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  CHECK_IN_REQUESTED: { icon: Clock3, className: "border-amber-300 bg-amber-50 text-amber-700" },
  NEEDS_HELP: { icon: TriangleAlert, className: "border-red-300 bg-red-50 text-red-700" },
  NOT_CHECKED_IN: { icon: CircleDashed, className: "border-slate-300 bg-slate-100 text-slate-500" },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function FamilyNetworkPanel() {
  const { user, authedFetch, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [members, setMembers] = useState<FamilyMemberView[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [incomingCheckIns, setIncomingCheckIns] = useState<IncomingCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [relationship, setRelationship] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await authedFetch("/api/family");
      const data = await res.json();
      setMembers(data.members ?? []);
      setPending(data.pendingRequests ?? []);
      setIncomingCheckIns(data.incomingCheckIns ?? []);
    } finally {
      setLoading(false);
    }
  }, [user, authedFetch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <p className="mb-3 text-sm text-slate-600">
          Log in to use the Family Safety Network — it needs an account so requests and check-ins can
          sync across everyone's phones.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          Log in / Sign up
        </Link>
      </div>
    );
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    const res = await authedFetch("/api/family/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, relationship }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || "Could not send request");
      return;
    }
    setFormSuccess(`Request sent to ${data.sentTo.name} (#${data.sentTo.uniqueCode})`);
    setCode("");
    setRelationship("");
  };

  const respondToRequest = async (connectionId: number, action: "accept" | "decline") => {
    await authedFetch("/api/family/respond", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ connectionId, action }),
    });
    refresh();
  };

  const requestCheckIn = async (connectionId: number) => {
    await authedFetch("/api/family/checkin-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ connectionId }),
    });
    refresh();
  };

  const respondCheckIn = async (connectionId: number, status: "SAFE" | "NEEDS_HELP") => {
    let location: { lat: number; lng: number } | null = null;
    if (status === "NEEDS_HELP" && "geolocation" in navigator) {
      location = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 5000 }
        );
      });
    }
    await authedFetch("/api/family/checkin-response", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ connectionId, status, location }),
    });
    refresh();
  };

  const removeMember = async (connectionId: number) => {
    await authedFetch("/api/family/remove", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ connectionId }),
    });
    refresh();
  };

  const safeCount = members.filter((m) => m.safetyStatus === "SAFE").length;
  const pendingCount = members.filter((m) => m.safetyStatus === "CHECK_IN_REQUESTED").length;
  const needsHelpCount = members.filter((m) => m.safetyStatus === "NEEDS_HELP").length;
  const needsHelpMembers = members.filter((m) => m.safetyStatus === "NEEDS_HELP");

  return (
    <div className="space-y-4">
      {needsHelpMembers.length > 0 && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-red-800">
            <TriangleAlert className="h-4 w-4" /> {t("familyNeedsHelpAlert")}
          </div>
          {needsHelpMembers.map((m) => (
            <div key={m.connectionId} className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-red-700">
              <span>&ldquo;{m.name} has requested assistance.&rdquo;</span>
              <div className="flex gap-2">
                {m.location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${m.location.lat},${m.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold hover:bg-red-100"
                  >
                    <MapPin className="h-3 w-3" /> {t("familyViewLocation")}
                  </a>
                )}
                <a
                  href={`tel:${m.phoneNumber}`}
                  className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  <PhoneCall className="h-3 w-3" /> {t("familyContact")}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("familySafetyTitle")}</h2>
          <span className="text-[10px] text-slate-500">
            {members.length} {t("familyMembers")}
          </span>
        </div>
        <div className="mb-4 flex gap-3 text-xs">
          <span className="text-emerald-700">🟢 {safeCount} {t("familySafe")}</span>
          <span className="text-amber-700">🟡 {pendingCount} {t("familyCheckInRequested")}</span>
          <span className="text-red-700">🔴 {needsHelpCount} {t("familyNeedsHelp")}</span>
        </div>

        <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3">
          <div className="text-[10px] font-medium tracking-wide text-teal-700">{t("familyYourId")}</div>
          <div className="font-mono text-lg font-bold text-teal-800">#{user.uniqueCode}</div>
        </div>

        {incomingCheckIns.length > 0 && (
          <div className="mb-4 space-y-2">
            {incomingCheckIns.map((c) => (
              <div key={c.connectionId} className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs">
                <p className="mb-2 text-amber-800">
                  <strong>{c.fromName}</strong> requested a safety check-in from you.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondCheckIn(c.connectionId, "SAFE")}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                  >
                    {t("familyImSafe")}
                  </button>
                  <button
                    onClick={() => respondCheckIn(c.connectionId, "NEEDS_HELP")}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700"
                  >
                    {t("familyINeedHelp")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pending.length > 0 && (
          <div className="mb-4 space-y-2">
            {pending.map((p) => (
              <div key={p.connectionId} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs">
                <span>
                  <strong>{p.fromName}</strong> (#{p.fromCode}) wants to add you as {p.relationship || "family"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToRequest(p.connectionId, "accept")}
                    className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                  >
                    <Check className="h-3 w-3" /> {t("familyAccept")}
                  </button>
                  <button
                    onClick={() => respondToRequest(p.connectionId, "decline")}
                    className="flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <X className="h-3 w-3" /> {t("familyDecline")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && members.length === 0 && (
          <p className="mb-4 text-xs text-slate-400">No family members yet — add one below.</p>
        )}

        <div className="space-y-2">
          {members.map((m) => {
            const meta = STATUS_META[m.safetyStatus];
            const Icon = meta.icon;
            return (
              <div key={m.connectionId} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{m.name}</div>
                    <div className="text-[11px] text-slate-500">{m.relationship || "Family"}</div>
                  </div>
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.className}`}>
                    <Icon className="h-3 w-3" /> {t(STATUS_LABEL_KEY[m.safetyStatus])}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  {t("familyLastCheckIn")}: {timeAgo(m.lastCheckIn)}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => requestCheckIn(m.connectionId)}
                    className="flex items-center gap-1.5 rounded-md border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-[11px] font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    <Send className="h-3 w-3" /> {t("familyRequestCheckIn")}
                  </button>
                  <button
                    onClick={() => removeMember(m.connectionId)}
                    className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-slate-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" /> {t("familyRemove")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-800">{t("familyAddMember")}</h3>
        <form onSubmit={handleSendRequest} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="#482731"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono outline-none focus:border-teal-400"
          />
          <input
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="Relationship (e.g. Brother)"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            disabled={code.length !== 6}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" /> {t("familySendRequest")}
          </button>
        </form>
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
        {formSuccess && <p className="mt-2 text-xs text-emerald-600">{formSuccess}</p>}
      </div>
    </div>
  );
}
