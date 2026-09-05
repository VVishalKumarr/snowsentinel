import { ShieldAlert } from "lucide-react";

const STATEMENTS = [
  "SnowSentinel is a hackathon prototype designed to demonstrate disaster preparedness and decision support.",
  "Satellite observations and AI-generated assessments can contain uncertainty.",
  "Live emergency information should be verified through official authorities.",
  "Priority zones and hazard paths shown in demo mode are simulated.",
  "SnowSentinel does not replace emergency services, professional hazard forecasting, or official evacuation orders.",
];

export default function TrustSection() {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert className="h-4.5 w-4.5 text-amber-700" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold tracking-wide text-amber-900">TRUST &amp; LIMITATIONS</h2>
      </div>
      <ul className="space-y-1.5">
        {STATEMENTS.map((s) => (
          <li key={s} className="text-xs leading-relaxed text-amber-900/90">
            • {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
