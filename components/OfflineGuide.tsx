import { BookOpenText } from "lucide-react";

const SECTIONS = [
  {
    title: "BEFORE A DISASTER",
    items: [
      "Know nearby shelters.",
      "Keep emergency contacts available.",
      "Prepare essential supplies.",
      "Establish family check-in procedures.",
    ],
  },
  {
    title: "DURING A HAZARD",
    items: [
      "Follow instructions from local authorities.",
      "Move away from identified danger areas when instructed.",
      "Avoid rivers, unstable slopes, and damaged infrastructure.",
      "Do not enter restricted areas.",
    ],
  },
  {
    title: "AFTER A DISASTER",
    items: [
      "Check your family safety network.",
      "Contact emergency services if needed.",
      "Avoid damaged structures.",
      "Use official information for updates.",
    ],
  },
];

export default function OfflineGuide() {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center gap-2">
        <BookOpenText className="h-4.5 w-4.5 text-teal-600" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">OFFLINE EMERGENCY GUIDE</h2>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        This guide is cached on your device and stays available with no internet connection.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-3">
            <h3 className="mb-2 text-xs font-semibold tracking-[0.08em] text-slate-600">{section.title}</h3>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li key={item} className="text-xs leading-relaxed text-slate-600">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
