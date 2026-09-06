"use client";

import { AlertOctagon } from "lucide-react";
import type { HazardScenario } from "@/lib/types";
import { generateAnomalies, RIDGE_BACK, RIDGE_MID, RIDGE_FRONT, SNOW_CAP_FULL } from "@/lib/satelliteArt";
import { useLanguage } from "@/lib/i18n";

export type ViewerVariant = "current" | "previous" | "compare";

interface SatelliteViewerProps {
  scenario: HazardScenario;
  variant: ViewerVariant;
  compact?: boolean;
}

export default function SatelliteViewer({ scenario, variant, compact = false }: SatelliteViewerProps) {
  const { t } = useLanguage();
  const changePct = scenario.environmentalChange.snowIceChangePct;
  const showAnomalies = variant === "current" || variant === "compare";
  const showDiffRings = variant === "compare";
  const anomalies = generateAnomalies(scenario.id, changePct);

  const dateLabel =
    variant === "previous" ? scenario.observationPrevious.date : scenario.observationCurrent.date;
  const obsLabel = t(
    variant === "previous" ? "previousObservationLabel" : variant === "current" ? "currentObservationLabel" : "changeComparisonLabel"
  );

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#060b12] shadow-sm ${compact ? "aspect-[4/3]" : "aspect-[16/9]"}`}>
      <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1526" />
            <stop offset="55%" stopColor="#0d1b2e" />
            <stop offset="100%" stopColor="#050a12" />
          </linearGradient>
          <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f8ff" />
            <stop offset="100%" stopColor="#b9d4e8" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="800" height="500" fill="url(#sky)" />

        {/* stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 173) % 800}
            cy={(i * 97) % 140}
            r={i % 5 === 0 ? 1.4 : 0.7}
            fill="#7fb8e0"
            opacity={0.35}
          />
        ))}

        <polygon points={RIDGE_BACK} fill="#16283e" />
        <polygon points={RIDGE_MID} fill="#12202f" />

        {/* snow cap */}
        <polygon
          points={SNOW_CAP_FULL}
          fill="url(#snow)"
          opacity={variant === "previous" ? 0.95 : 0.85}
        />

        {showAnomalies &&
          anomalies.map((a, i) => (
            <ellipse
              key={i}
              cx={a.cx}
              cy={a.cy}
              rx={a.rx}
              ry={a.ry}
              transform={`rotate(${a.rot} ${a.cx} ${a.cy})`}
              fill="#3a2f28"
              opacity={a.opacity}
            />
          ))}

        {showDiffRings &&
          anomalies.map((a, i) => (
            <ellipse
              key={`ring-${i}`}
              cx={a.cx}
              cy={a.cy}
              rx={a.rx + 8}
              ry={a.ry + 6}
              transform={`rotate(${a.rot} ${a.cx} ${a.cy})`}
              fill="none"
              stroke="#f87171"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.85}
            />
          ))}

        <polygon points={RIDGE_FRONT} fill="#0b1520" />

        {/* contour lines for texture */}
        {[80, 140, 200].map((yOff, i) => (
          <path
            key={i}
            d={`M0,${420 - yOff} Q200,${400 - yOff} 400,${420 - yOff} T800,${410 - yOff}`}
            fill="none"
            stroke="#1c2e42"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}
      </svg>

      {/* scan grid + sweep overlay */}
      <div className="scan-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cyan-400/10 to-transparent scan-sweep" />

      {/* HUD */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1">
        <AlertOctagon className="h-3 w-3 text-amber-400" strokeWidth={2} />
        <span className="text-[9px] font-semibold tracking-[0.1em] text-amber-300">{t("demoObservationBadge")}</span>
      </div>

      {showDiffRings && (
        <div className="absolute right-3 top-3 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1">
          <span className="text-[9px] font-semibold tracking-[0.1em] text-red-300">{t("changeLayerActiveBadge")}</span>
        </div>
      )}

      <div className="absolute bottom-3 left-3">
        <div className="text-[10px] font-medium tracking-[0.14em] text-slate-300">{obsLabel}</div>
        <div className="font-mono text-xs text-cyan-300">{dateLabel}</div>
      </div>

      <div className="absolute bottom-3 right-3 text-right">
        <div className="font-mono text-[10px] text-slate-500">
          {scenario.region.center[0].toFixed(2)}°N {scenario.region.center[1].toFixed(2)}°E
        </div>
        <div className="text-[9px] tracking-wide text-slate-600">{t("syntheticRenderNote")}</div>
      </div>
    </div>
  );
}
