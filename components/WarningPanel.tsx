import { TriangleAlert, CheckCircle2 } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import { RISK_LEVEL_COLORS } from "@/lib/riskEngine";

export default function WarningPanel({ scenario }: { scenario: HazardScenario }) {
  const colors = RISK_LEVEL_COLORS[scenario.risk.riskLevel];

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${colors.bg} ${colors.border}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <TriangleAlert className={`h-5 w-5 ${colors.text}`} strokeWidth={2} />
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">PREPAREDNESS ALERT</h2>
        <span className={`ml-auto rounded-full border bg-white px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${colors.border} ${colors.text}`}>
          {scenario.risk.riskLevel}
        </span>
      </div>

      <p className="text-sm text-slate-700">
        {scenario.risk.riskLevel === "LOW"
          ? "Recent observations show minimal change for the simulated scenario. Routine monitoring is sufficient at this time."
          : "Recent observations show changes that warrant increased monitoring in the simulated scenario."}
      </p>

      <div className="mt-4 border-t border-slate-200/70 pt-4">
        <h3 className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-slate-500">
          RECOMMENDED ACTIONS
        </h3>
        <ul className="space-y-1.5">
          {scenario.recommendedActions.map((action) => (
            <li key={action} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" strokeWidth={2} />
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
