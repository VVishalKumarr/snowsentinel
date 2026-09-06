"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock3,
  TriangleAlert,
  CircleDashed,
  Send,
  Search,
  UserPlus,
  Check,
  X,
  Trash2,
  MapPin,
  PhoneCall,
  Siren,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import type { FamilyMemberView } from "@/lib/family";
import { useNotifications } from "@/lib/NotificationContext";

const STATUS_LABEL_KEY: Record<FamilyMemberView["safetyStatus"], TranslationKey> = {
  SAFE: "familySafe",
  CHECK_IN_REQUESTED: "familyCheckInRequested",
  NEEDS_HELP: "familyNeedsHelp",
  NOT_CHECKED_IN: "familyNotCheckedIn",
};

const STATUS_META: Record<
  FamilyMemberView["safetyStatus"],
  { icon: typeof ShieldCheck; className: string }
> = {
  SAFE: { icon: ShieldCheck, className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  CHECK_IN_REQUESTED: { icon: Clock3, className: "border-amber-300 bg-amber-50 text-amber-700" },
  NEEDS_HELP: { icon: TriangleAlert, className: "border-red-300 bg-red-50 text-red-700" },
  NOT_CHECKED_IN: { icon: CircleDashed, className: "border-slate-300 bg-slate-100 text-slate-500" },
};

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

function timeAgo(iso: string | null, t: Translate): string {
  if (!iso) return t("familyTimeNever");
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return t("familyTimeJustNow");
  if (mins < 60) return t("familyTimeMinAgo", { count: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t("familyTimeHoursAgo", { count: hours });
  return t("familyTimeDaysAgo", { count: Math.round(hours / 24) });
}

function mapsUrl(location: { lat: number; lng: number }) {
  return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
}

export default function FamilyNetworkPanel() {
  const { user, authedFetch, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const {
    members,
    pendingRequests: pending,
    incomingCheckIns,
    incomingSosAlerts: incomingSos,
    myActiveSentSos,
    sosHistory,
    acknowledgeSos,
    markSosRead,
    resolveSos,
    refresh,
  } = useNotifications();

  const [searchUsername, setSearchUsername] = useState("");
  const [relationship, setRelationship] = useState("");
  const [searchResult, setSearchResult] = useState<{ name: string; username: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <p className="mb-3 text-sm text-slate-600">{t("familyLoginRequired")}</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          {t("authLogin")}
        </Link>
      </div>
    );
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchResult(null);
    setFormSuccess(null);
    const res = await authedFetch(`/api/family/search?username=${encodeURIComponent(searchUsername)}`);
    const data = await res.json();
    if (!data.found) {
      setSearchError(t("familyUserNotFound"));
      return;
    }
    setSearchResult({ name: data.name, username: data.username });
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    setFormError(null);
    setFormSuccess(null);
    const res = await authedFetch("/api/family/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: searchResult.username, relationship }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || t("authUnableToCreate"));
      return;
    }
    setFormSuccess(`${t("familyRequestSent")}: @${data.sentTo.username}`);
    setSearchResult(null);
    setSearchUsername("");
    setRelationship("");
    refresh();
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
  const activeIncomingSos = incomingSos.filter((a) => !a.resolvedAt);
  const sosActiveCount = activeIncomingSos.length + myActiveSentSos.length;

  return (
    <div className="space-y-4">
      {activeIncomingSos.length > 0 && (
        <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-red-800">
            <Siren className="h-4 w-4" /> {t("activeSosTitle")}
          </div>
          <div className="space-y-3">
            {activeIncomingSos.map((a) => (
              <div key={a.id} className="rounded-xl border border-red-200 bg-white p-3">
                <div className="text-sm font-semibold text-slate-800">@{a.senderUsername}</div>
                <p className="mt-0.5 text-sm text-red-700">
                  {t("sosActivatedMessage", { name: a.senderName })} {t("sosMayNeedImmediateAssistance")}
                </p>
                <div className="mt-1 text-[11px] text-slate-400">{t("sosActivatedTimeAgo", { time: timeAgo(a.createdAt, t) })}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {a.location ? (
                    <a
                      href={mapsUrl(a.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markSosRead(a.id)}
                      className="flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <MapPin className="h-3 w-3" /> {t("sosViewLocation")}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">{t("locationNotAvailableBadge")}</span>
                  )}
                  {a.status === "ACKNOWLEDGED" ? (
                    <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {t("alertAcknowledged")}
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeSos(a.id)}
                      className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      {t("alertAcknowledge")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {myActiveSentSos.length > 0 && (
        <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-orange-800">
            <Siren className="h-4 w-4" /> {t("activeSosTitle")} — {t("sosSentToFamily")}
          </div>
          <div className="space-y-3">
            {myActiveSentSos.map((sos) => (
              <div key={sos.sosId} className="rounded-xl border border-orange-200 bg-white p-3">
                <div className="text-[11px] text-slate-400">{t("sosActivatedTimeAgo", { time: timeAgo(sos.createdAt, t) })}</div>
                <div className="mt-2 text-xs font-semibold tracking-wide text-slate-500">{t("familyResponseTitle")}</div>
                <div className="mt-1 space-y-1">
                  {sos.recipients.map((r) => (
                    <div key={r.userId} className="flex items-center gap-1.5 text-sm">
                      <span>{r.status === "ACKNOWLEDGED" ? "🟢" : "⚪"}</span>
                      <span className="text-slate-700">{r.name}</span>
                      <span className="text-slate-400">
                        — {r.status === "ACKNOWLEDGED" ? t("alertAcknowledged") : t("notSeenLabel")}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => resolveSos(sos.sosId)}
                  className="mt-3 rounded-md border border-orange-300 bg-white px-2.5 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                >
                  {t("resolveButton")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {needsHelpMembers.length > 0 && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-red-800">
            <TriangleAlert className="h-4 w-4" /> {t("familyNeedsHelpAlert")}
          </div>
          {needsHelpMembers.map((m) => (
            <div key={m.connectionId} className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-red-700">
              <span>&ldquo;{t("familyNeedsAssistanceMessage", { name: m.name })}&rdquo;</span>
              <div className="flex gap-2">
                {m.location && (
                  <a
                    href={mapsUrl(m.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold hover:bg-red-100"
                  >
                    <MapPin className="h-3 w-3" /> {t("familyViewLocation")}
                  </a>
                )}
                {m.phoneNumber && (
                  <a
                    href={`tel:${m.phoneNumber}`}
                    className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    <PhoneCall className="h-3 w-3" /> {t("familyContact")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("familySafetyNetwork")}</h2>
          <span className="text-[10px] text-slate-500">
            {members.length} {t("familyMembers")}
          </span>
        </div>
        <div className="mb-4 flex flex-wrap gap-3 text-xs">
          <span className="text-emerald-700">🟢 {safeCount} {t("familySafe")}</span>
          <span className="text-amber-700">🟡 {pendingCount} {t("familyCheckInRequested")}</span>
          <span className="text-red-700">🔴 {needsHelpCount} {t("familyNeedsHelp")}</span>
          {sosActiveCount > 0 && (
            <span className="font-semibold text-red-700">🚨 {sosActiveCount} {t("sosActiveLabel")}</span>
          )}
        </div>

        <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3">
          <div className="text-[10px] font-medium tracking-wide text-teal-700">{t("authUsername")}</div>
          <div className="font-mono text-lg font-bold text-teal-800">@{user.username}</div>
        </div>

        {incomingCheckIns.length > 0 && (
          <div className="mb-4 space-y-2">
            {incomingCheckIns.map((c) => (
              <div key={c.connectionId} className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs">
                <p className="mb-2 text-amber-800">
                  <strong>{c.fromName}</strong> {t("familyCheckinRequestMessage")}
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
              <div key={p.connectionId} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                <p className="mb-2 font-semibold text-slate-700">{t("familyNewRequestTitle")}</p>
                <p className="mb-2 text-slate-600">
                  @{p.fromUsername} {t("familyWantsToConnect")}
                </p>
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

        {members.length === 0 && <p className="mb-4 text-xs text-slate-400">{t("familyNoMembersYet")}</p>}

        <div className="space-y-2">
          {members.map((m) => {
            const meta = STATUS_META[m.safetyStatus];
            const Icon = meta.icon;
            return (
              <div key={m.connectionId} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{m.name}</div>
                    <div className="text-[11px] text-slate-500">
                      @{m.username} · {m.relationship || t("familyDefaultRelationship")}
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.className}`}>
                    <Icon className="h-3 w-3" /> {t(STATUS_LABEL_KEY[m.safetyStatus])}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  {t("familyLastCheckIn")}: {timeAgo(m.lastCheckIn, t)}
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
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            value={searchUsername}
            onChange={(e) => {
              setSearchUsername(e.target.value);
              setSearchResult(null);
            }}
            placeholder={t("familySearchUsername")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 sm:col-span-2"
          />
          <button
            type="submit"
            disabled={!searchUsername}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Search className="h-3.5 w-3.5" /> {t("familySearchUser")}
          </button>
        </form>
        {searchError && <p className="mt-2 text-xs text-red-600">{searchError}</p>}

        {searchResult && (
          <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
            <div className="text-xs text-slate-500">{t("familyName")}</div>
            <div className="text-sm font-semibold text-slate-800">{searchResult.name}</div>
            <div className="mt-1 text-xs text-slate-500">{t("familyUsername")}</div>
            <div className="font-mono text-sm text-teal-700">@{searchResult.username}</div>
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder={t("familyRelationshipPlaceholder")}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
            />
            <button
              onClick={handleSendRequest}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <UserPlus className="h-3.5 w-3.5" /> {t("familySendFamilyRequest")}
            </button>
          </div>
        )}
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
        {formSuccess && <p className="mt-2 text-xs text-emerald-600">{formSuccess}</p>}
      </div>

      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        <button
          onClick={() => setHistoryOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold tracking-wide text-slate-800">{t("sosHistoryTitle")}</h3>
          <span className="text-xs text-slate-400">{historyOpen ? "▲" : "▼"}</span>
        </button>
        {historyOpen && (
          <div className="mt-3 space-y-2">
            {sosHistory.length === 0 && <p className="text-xs text-slate-400">{t("sosHistoryEmpty")}</p>}
            {sosHistory.map((h) => (
              <div
                key={`${h.direction}-${h.sosId}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Siren className="h-3.5 w-3.5 text-red-500" />
                  <div>
                    <div className="font-medium text-slate-700">
                      {h.direction === "SENT" ? user.name : h.counterpartName}
                    </div>
                    <div className="text-[10px] text-slate-400">{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    h.status === "RESOLVED"
                      ? "border-slate-300 bg-slate-100 text-slate-500"
                      : h.status === "ACKNOWLEDGED"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-red-300 bg-red-50 text-red-700"
                  }`}
                >
                  {h.status === "RESOLVED" ? t("statusResolved") : h.status === "ACKNOWLEDGED" ? t("alertAcknowledged") : t("sosSent")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
