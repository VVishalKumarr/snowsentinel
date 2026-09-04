import type { TimelinePoint } from "@/lib/types";

export default function Timeline({ points }: { points: TimelinePoint[] }) {
  const max = 100;
  return (
    <div className="relative flex items-end justify-between gap-2">
      <div className="pointer-events-none absolute left-0 right-0 top-[calc(6rem-1px)] h-px bg-white/10" aria-hidden />
      {points.map((p) => (
        <div key={p.date} className="relative flex flex-1 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-end justify-center gap-1">
            <div
              className="w-2.5 rounded-t-sm bg-cyan-500/70 transition-all"
              style={{ height: `${(p.snowIceIndex / max) * 100}%` }}
              title={`Snow/Ice index: ${p.snowIceIndex}`}
            />
            <div
              className="w-2.5 rounded-t-sm bg-slate-400/40 transition-all"
              style={{ height: `${(p.surfaceIndex / max) * 100}%` }}
              title={`Surface index: ${p.surfaceIndex}`}
            />
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 ring-4 ring-[#05080d]" />
          <div className="text-[10px] font-medium tracking-wide text-slate-500">{p.label}</div>
        </div>
      ))}
    </div>
  );
}
