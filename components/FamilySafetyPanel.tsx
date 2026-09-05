"use client";

import { ShieldCheck, Clock3, TriangleAlert, CircleDashed, Send } from "lucide-react";
import { useAppState } from "@/lib/AppStateContext";
import { formatRelative } from "@/lib/emergencyData";
import type { SafetyStatus } from "@/lib/emergencyTypes";

const STATUS_META: Record<SafetyStatus, { label: string; className: string; icon: typeof ShieldCheck }> = {
  SAFE: { label: "🟢 SAFE", className: "border-emerald-300 bg-emerald-50 text-emerald-700", icon: ShieldCheck },
  CHECK_IN_REQUESTED: { label: "🟡 CHECK-IN REQUESTED", className: "border-amber-300 bg-amber-50 text-amber-700", icon: Clock3 },
  NEEDS_HELP: { label: "🔴 NEEDS HELP", className: "border-red-300 bg-red-50 text-red-700", icon: TriangleAlert },
  NOT_CHECKED_IN: { label: "⚪ NOT CHECKED IN", className: "border-slate-300 bg-slate-100 text-slate-500", icon: CircleDashed },
};

export default function FamilySafetyPanel() {
  const { familyMembers, requestCheckIn, respondCheckIn } = useAppState();
  const safeCount = familyMembers.filter((m) => m.status === "SAFE").length;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">FAMILY SAFETY</h2>
        <span className="text-[10px] text-slate-500">
          {safeCount}/{familyMembers.length} checked in
        </span>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Simulated locally for this prototype — not real-time tracking. Requires explicit consent from
        each person in a real deployment.
      </p>

      <div className="space-y-2">
        {familyMembers.map((m) => {
          const meta = STATUS_META[m.status];
          return (
            <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{m.name}</div>
                  <div className="text-[11px] text-slate-500">{m.relationship}</div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
              <div className="mt-1.5 text-[11px] text-slate-400">
                Last check-in: {formatRelative(m.lastCheckIn)}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {m.status !== "CHECK_IN_REQUESTED" && m.relationship !== "You" && (
                  <button
                    onClick={() => requestCheckIn(m.id)}
                    className="flex items-center gap-1.5 rounded-md border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-[11px] font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    <Send className="h-3 w-3" /> REQUEST CHECK-IN
                  </button>
                )}
                {m.status === "CHECK_IN_REQUESTED" && (
                  <>
                    <span className="self-center text-[10px] text-slate-400">Simulate their response:</span>
                    <button
                      onClick={() => respondCheckIn(m.id, "SAFE")}
                      className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                    >
                      I&apos;M SAFE
                    </button>
                    <button
                      onClick={() => respondCheckIn(m.id, "NEEDS_HELP")}
                      className="rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700"
                    >
                      I NEED HELP
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
