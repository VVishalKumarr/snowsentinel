"use client";

import { useMemo, useState } from "react";
import { HandHeart } from "lucide-react";
import { VOLUNTEERS } from "@/lib/emergencyData";
import type { Volunteer, VolunteerSkill } from "@/lib/emergencyTypes";

const ALL_SKILLS: VolunteerSkill[] = [
  "First Aid",
  "Search & Rescue",
  "Transport",
  "Food",
  "Logistics",
  "Translation",
  "Shelter Support",
];

const STATUS_STYLE: Record<Volunteer["status"], string> = {
  AVAILABLE: "border-emerald-300 bg-emerald-50 text-emerald-700",
  DEPLOYED: "border-amber-300 bg-amber-50 text-amber-700",
  OFFLINE: "border-slate-300 bg-slate-100 text-slate-500",
};

export default function VolunteerList() {
  const [skillFilter, setSkillFilter] = useState<VolunteerSkill | null>(null);

  const volunteers = useMemo(
    () => VOLUNTEERS.filter((v) => !skillFilter || v.skills.includes(skillFilter)),
    [skillFilter]
  );
  const availableCount = VOLUNTEERS.filter((v) => v.status === "AVAILABLE").length;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">COMMUNITY VOLUNTEERS</h2>
        <span className="text-[10px] text-slate-500">{availableCount} available (demo)</span>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Anonymous IDs only — exact volunteer locations are never shown publicly, per privacy design.
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setSkillFilter(null)}
          className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
            !skillFilter ? "border-teal-300 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          All skills
        </button>
        {ALL_SKILLS.map((skill) => (
          <button
            key={skill}
            onClick={() => setSkillFilter(skill)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              skillFilter === skill
                ? "border-teal-300 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {volunteers.map((v) => (
          <div key={v.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <HandHeart className="h-4 w-4 text-teal-600" /> VOLUNTEER {v.id}
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[v.status]}`}>
                {v.status}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              <div className="text-[10px] text-slate-400">Area</div>
              <div className="text-slate-700">{v.area}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {v.skills.map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
        {volunteers.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-slate-400">
            No volunteers match this skill filter.
          </p>
        )}
      </div>
    </div>
  );
}
