"use client";

// DemoHazardControlPanel — the presenter-facing control for the hackathon
// demo. Triggering it does NOT just change local React state: it POSTs to
// /api/hazard-alerts, which persists a real hazard_alerts row, determines
// affected recipients from their self-reported region, and fans out real
// push notifications (FCM/Web Push) to every device those users have
// registered — see lib/hazardAlerts.ts and lib/pushService.ts. This panel
// is explicitly labeled DEMO MODE and must never be mistaken for a real
// detection capability.

import { useState } from "react";
import { Siren, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useScenario } from "@/lib/ScenarioContext";
import { useLanguage } from "@/lib/i18n";
import { REGIONS } from "@/lib/demoData";
import {
  HAZARD_TYPES,
  ALERT_LEVELS,
  HAZARD_TYPE_LABEL_KEY,
  ALERT_LEVEL_LABEL_KEY,
  type HazardType,
  type AlertLevel,
} from "@/lib/alertLevels";
import { CROWD_DENSITY_LABEL_KEY, type CrowdDensity } from "@/lib/crowdDensity";

const CROWD_DENSITIES: CrowdDensity[] = ["LOW", "MODERATE", "HIGH", "VERY_HIGH"];

const DEFAULT_COUNTDOWN_SECONDS: Record<AlertLevel, number | null> = {
  LOW: null,
  MODERATE: null,
  HIGH: 10800, // 3h
  CRITICAL: 6138, // 01:42:18 — matches the spec's example
};

const DEFAULT_CROWD_DENSITY: Record<AlertLevel, CrowdDensity> = {
  LOW: "LOW",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
  CRITICAL: "VERY_HIGH",
};

function formatCountdownPreview(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function DemoHazardControlPanel() {
  const { authedFetch } = useAuth();
  const { scenario } = useScenario();
  const { t } = useLanguage();

  const [hazardType, setHazardType] = useState<HazardType>("AVALANCHE");
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("CRITICAL");
  const [regionId, setRegionId] = useState(scenario.region.id);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(DEFAULT_COUNTDOWN_SECONDS.CRITICAL);
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensity>(DEFAULT_CROWD_DENSITY.CRITICAL);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [resultText, setResultText] = useState<string | null>(null);

  const handleLevelChange = (level: AlertLevel) => {
    setAlertLevel(level);
    setCountdownSeconds(DEFAULT_COUNTDOWN_SECONDS[level]);
    setCrowdDensity(DEFAULT_CROWD_DENSITY[level]);
  };

  const handleTrigger = async () => {
    setStatus("sending");
    setResultText(null);
    try {
      const res = await authedFetch("/api/hazard-alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hazardType, alertLevel, regionId, countdownSeconds, crowdDensity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setStatus("success");
      setResultText(t("demoTriggerSuccess", { count: data.notifiedCount ?? 0 }));
    } catch {
      setStatus("error");
      setResultText(t("demoTriggerFailed"));
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-amber-200 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-800">
          <Siren className="h-4 w-4 text-amber-600" /> {t("demoModeNavLabel")}
        </div>
        <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-700">
          {t("demoModeWarningBadge")}
        </span>
      </div>
      <p className="mb-4 text-xs text-slate-500">{t("demoModeWarningText")}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs">
          <span className="mb-1 block font-medium text-slate-500">{t("demoHazardTypeLabel")}</span>
          <select
            value={hazardType}
            onChange={(e) => setHazardType(e.target.value as HazardType)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
          >
            {HAZARD_TYPES.map((ht) => (
              <option key={ht} value={ht}>
                {t(HAZARD_TYPE_LABEL_KEY[ht])}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs">
          <span className="mb-1 block font-medium text-slate-500">{t("demoAlertLevelLabel")}</span>
          <select
            value={alertLevel}
            onChange={(e) => handleLevelChange(e.target.value as AlertLevel)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
          >
            {ALERT_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {t(ALERT_LEVEL_LABEL_KEY[lvl])}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs">
          <span className="mb-1 block font-medium text-slate-500">{t("demoAffectedAreaLabel")}</span>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.shortName}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs">
          <span className="mb-1 block font-medium text-slate-500">
            {t("demoCountdownLabel")}
            {countdownSeconds != null && <span className="ml-1 font-mono text-slate-400">({formatCountdownPreview(countdownSeconds)})</span>}
          </span>
          <input
            type="number"
            min={0}
            value={countdownSeconds ?? ""}
            placeholder="—"
            onChange={(e) => setCountdownSeconds(e.target.value === "" ? null : Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-teal-400"
          />
        </label>

        <label className="text-xs sm:col-span-2">
          <span className="mb-1 block font-medium text-slate-500">{t("crowdDensityFieldLabel")}</span>
          <select
            value={crowdDensity}
            onChange={(e) => setCrowdDensity(e.target.value as CrowdDensity)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
          >
            {CROWD_DENSITIES.map((cd) => (
              <option key={cd} value={cd}>
                {t(CROWD_DENSITY_LABEL_KEY[cd])}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        onClick={handleTrigger}
        disabled={status === "sending"}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("demoTriggerSending")}
          </>
        ) : (
          <>
            <Siren className="h-4 w-4" /> {t("demoTriggerButton")}
          </>
        )}
      </button>

      {resultText && (
        <p className={`mt-2 text-xs ${status === "success" ? "text-emerald-700" : "text-red-600"}`}>{resultText}</p>
      )}
    </div>
  );
}
