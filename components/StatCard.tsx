import { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  sublabel?: string;
  tone?: "default" | "warning" | "danger" | "success";
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-teal-700",
  warning: "text-amber-700",
  danger: "text-red-700",
  success: "text-emerald-700",
};

export default function StatCard({ icon: Icon, label, value, sublabel, tone = "default" }: StatCardProps) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold tabular-nums ${toneClasses[tone]}`}>{value}</div>
      {sublabel && <div className="mt-1 text-xs text-slate-500">{sublabel}</div>}
    </div>
  );
}
