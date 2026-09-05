"use client";

import { Info, Eye, TriangleAlert, Flame, CheckCircle2 } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import type { AlertType } from "@/lib/emergencyTypes";
import { buildAlertForScenario } from "@/lib/emergencyData";
import { useAppState } from "@/lib/AppStateContext";

const TYPE_META: Record<AlertType, { icon: typeof Info; className: string }> = {
  INFO: { icon: Info, className: "border-slate-300 bg-slate-50 text-slate-700" },
  WATCH: { icon: Eye, className: "border-amber-300 bg-amber-50 text-amber-800" },
  WARNING: { icon: TriangleAlert, className: "border-orange-300 bg-orange-50 text-orange-800" },
  CRITICAL: { icon: Flame, className: "border-red-300 bg-red-50 text-red-800" },
};

export default function AlertCenter({ scenario }: { scenario: HazardScenario }) {
  const { acknowledgedAlertIds, acknowledgeAlert } = useAppState();
  const alert = buildAlertForScenario(scenario);
  const meta = TYPE_META[alert.type];
  const Icon = meta.icon;
  const acknowledged = acknowledgedAlertIds.includes(alert.id);

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${meta.className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h2 className="text-sm font-semibold tracking-wide">
            {alert.type} — {alert.title.toUpperCase()}
          </h2>
        </div>
        {acknowledged ? (
          <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold">
            <CheckCircle2 className="h-3 w-3" /> ACKNOWLEDGED
          </span>
        ) : (
          <button
            onClick={() => acknowledgeAlert(alert.id)}
            className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold shadow-sm hover:shadow"
          >
            ACKNOWLEDGE
          </button>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
        <Field label="WHAT" value={alert.what} />
        <Field label="WHERE" value={alert.where} />
        <Field label="WHY" value={alert.why} />
        <Field label="IMPACT" value={alert.impact} />
        <Field label="ACTION" value={alert.action} />
        <Field label="SOURCE" value={alert.source} />
        <Field label="CONFIDENCE" value={alert.confidence} />
      </dl>
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
