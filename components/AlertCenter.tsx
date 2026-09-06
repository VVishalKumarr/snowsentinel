"use client";

import { Info, Eye, TriangleAlert, Flame, CheckCircle2, Volume2 } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import type { AlertType } from "@/lib/emergencyTypes";
import type { TranslationKey } from "@/lib/i18n/en";
import { buildAlertForScenario } from "@/lib/emergencyData";
import { useAppState } from "@/lib/AppStateContext";
import { useLanguage } from "@/lib/i18n";
import { useHazardAlert } from "@/lib/HazardAlertContext";
import RiskCountdown from "./RiskCountdown";

const TYPE_META: Record<AlertType, { icon: typeof Info; className: string; labelKey: TranslationKey }> = {
  INFO: { icon: Info, className: "border-slate-300 bg-slate-50 text-slate-700", labelKey: "alertTypeInfo" },
  WATCH: { icon: Eye, className: "border-amber-300 bg-amber-50 text-amber-800", labelKey: "alertTypeWatch" },
  WARNING: { icon: TriangleAlert, className: "border-orange-300 bg-orange-50 text-orange-800", labelKey: "alertTypeWarning" },
  CRITICAL: { icon: Flame, className: "border-red-300 bg-red-50 text-red-800", labelKey: "alertTypeCritical" },
};

const CONFIDENCE_LABEL_KEY: Record<"LOW" | "MODERATE" | "HIGH", TranslationKey> = {
  LOW: "confidenceLow",
  MODERATE: "confidenceModerate",
  HIGH: "confidenceHigh",
};

export default function AlertCenter({ scenario }: { scenario: HazardScenario }) {
  const { acknowledgedAlertIds, acknowledgeAlert } = useAppState();
  const { t } = useLanguage();
  const { alertLevel, speakAlert, voiceSupported } = useHazardAlert();
  const alert = buildAlertForScenario(scenario, t);
  const meta = TYPE_META[alert.type];
  const Icon = meta.icon;
  const acknowledged = acknowledgedAlertIds.includes(alert.id);
  const canSpeak = voiceSupported && (alertLevel === "HIGH" || alertLevel === "CRITICAL");

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 sm:p-5 ${meta.className}`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <h2 className="text-sm font-semibold tracking-wide">
              {t(meta.labelKey)} — {alert.title.toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {canSpeak && (
              <button
                onClick={() => speakAlert(alertLevel)}
                aria-label={t("voiceAlertsLabel")}
                className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold shadow-sm hover:shadow"
              >
                <Volume2 className="h-3 w-3" />
              </button>
            )}
            {acknowledged ? (
              <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold">
                <CheckCircle2 className="h-3 w-3" /> {t("alertAcknowledged")}
              </span>
            ) : (
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold shadow-sm hover:shadow"
              >
                {t("alertAcknowledge")}
              </button>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
          <Field label={t("alertWhat")} value={alert.what} />
          <Field label={t("alertWhere")} value={alert.where} />
          <Field label={t("alertWhy")} value={alert.why} />
          <Field label={t("alertImpact")} value={alert.impact} />
          <Field label={t("alertAction")} value={alert.action} />
          <Field label={t("alertSource")} value={alert.source} />
          <Field label={t("alertConfidence")} value={t(CONFIDENCE_LABEL_KEY[alert.confidence])} />
        </dl>
      </div>

      <RiskCountdown />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-wide opacity-70">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
