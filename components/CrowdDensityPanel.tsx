"use client";

import { Users } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { getCrowdDensityForScenario, getTotalEstimatedPeople, CROWD_DENSITY_LABEL_KEY, CROWD_DENSITY_EMOJI } from "@/lib/crowdDensity";
import { ALERT_LEVEL_LABEL_KEY, ALERT_LEVEL_EMOJI, ALERT_LEVEL_COLORS } from "@/lib/alertLevels";

export default function CrowdDensityPanel({ scenario }: { scenario: HazardScenario }) {
  const { t } = useLanguage();
  const items = getCrowdDensityForScenario(scenario).sort((a, b) => b.estimatedPeople - a.estimatedPeople);
  const total = getTotalEstimatedPeople(scenario);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-slate-800">
          <Users className="h-4 w-4 text-teal-600" /> {t("crowdDensityTitle")}
        </h2>
        <span className="rounded border border-slate-200 px-2 py-0.5 text-[9px] tracking-wide text-slate-500">
          {t("demoCrowdDataBadge")}
        </span>
      </div>
      <div className="mb-3 text-xs text-slate-500">
        {t("estimatedPeopleLabel")}: <span className="font-mono font-semibold text-slate-700">{total.toLocaleString()}</span>
      </div>

      <div className="space-y-2">
        {items.map((c) => {
          const colors = ALERT_LEVEL_COLORS[c.priority];
          return (
            <div key={c.settlementId} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
              <div>
                <div className="font-medium text-slate-700">{c.settlementName}</div>
                <div className="text-slate-400">
                  {t("estimatedPeopleLabel")}: {c.estimatedPeople.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div>{CROWD_DENSITY_EMOJI[c.density]} {t(CROWD_DENSITY_LABEL_KEY[c.density])}</div>
                <div className={`mt-0.5 font-semibold ${colors.text}`}>
                  {ALERT_LEVEL_EMOJI[c.priority]} {t(ALERT_LEVEL_LABEL_KEY[c.priority])}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
