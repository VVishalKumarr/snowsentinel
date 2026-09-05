import { AlertTriangle, ShieldCheck, ShieldAlert, Flame } from "lucide-react";
import type { RiskLevel } from "@/lib/types";
import { RISK_LEVEL_COLORS } from "@/lib/riskEngine";

const LEVEL_ICON: Record<RiskLevel, typeof AlertTriangle> = {
  LOW: ShieldCheck,
  MEDIUM: ShieldAlert,
  ELEVATED: AlertTriangle,
  HIGH: Flame,
};

interface RiskIndicatorProps {
  level: RiskLevel;
  size?: "sm" | "lg";
}

export default function RiskIndicator({ level, size = "lg" }: RiskIndicatorProps) {
  const colors = RISK_LEVEL_COLORS[level];
  const Icon = LEVEL_ICON[level];

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${colors.bg} ${colors.border} ${colors.text}`}
      >
        <Icon className="h-3 w-3" strokeWidth={2} />
        {level}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-xl border px-5 py-3 shadow-sm ${colors.bg} ${colors.border}`}
    >
      <Icon className={`h-6 w-6 ${colors.text}`} strokeWidth={1.75} />
      <span className={`text-xl font-bold tracking-wide ${colors.text}`}>{level}</span>
    </div>
  );
}

export function RiskScale({ active }: { active: RiskLevel }) {
  const levels: RiskLevel[] = ["LOW", "MEDIUM", "ELEVATED", "HIGH"];
  return (
    <div className="flex items-center gap-1.5">
      {levels.map((lvl) => {
        const colors = RISK_LEVEL_COLORS[lvl];
        const isActive = lvl === active;
        return (
          <div
            key={lvl}
            className={`flex-1 rounded-md border py-1.5 text-center text-[10px] font-semibold tracking-wide transition-all ${
              isActive ? `${colors.bg} ${colors.border} ${colors.text}` : "border-slate-200 text-slate-400"
            }`}
          >
            {lvl}
          </div>
        );
      })}
    </div>
  );
}
