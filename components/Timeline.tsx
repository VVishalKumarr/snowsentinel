"use client";

import type { TimelinePoint } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

export default function Timeline({ points }: { points: TimelinePoint[] }) {
  const { t } = useLanguage();
  const max = 100;
  return (
    <div className="relative flex items-end justify-between gap-2">
      <div className="pointer-events-none absolute left-0 right-0 top-[calc(6rem-1px)] h-px bg-slate-200" aria-hidden />
      {points.map((p) => (
        <div key={p.date} className="relative flex flex-1 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-end justify-center gap-1">
            <div
              className="w-2.5 rounded-t-sm bg-teal-500 transition-all"
              style={{ height: `${(p.snowIceIndex / max) * 100}%` }}
              title={t("snowIceIndexTooltip", { value: p.snowIceIndex })}
            />
            <div
              className="w-2.5 rounded-t-sm bg-slate-300 transition-all"
              style={{ height: `${(p.surfaceIndex / max) * 100}%` }}
              title={t("surfaceIndexTooltip", { value: p.surfaceIndex })}
            />
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-teal-600 ring-4 ring-white" />
          <div className="text-[10px] font-medium tracking-wide text-slate-500">{p.label}</div>
        </div>
      ))}
    </div>
  );
}
