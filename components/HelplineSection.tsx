import { PhoneCall, Siren } from "lucide-react";
import { emergencyContacts, telHref } from "@/lib/emergencyContacts.config";

export default function HelplineSection() {
  const primary = emergencyContacts.find((c) => c.category === "Emergency");
  const rest = emergencyContacts.filter((c) => c.category !== "Emergency");

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <h2 className="mb-1 text-sm font-semibold tracking-wide text-slate-800">EMERGENCY HELPLINE</h2>
      <p className="mb-4 text-xs text-slate-500">
        Numbers below are read from a local configuration file and are only shown once entered — see{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5">lib/emergencyContacts.config.ts</code>.
      </p>

      {primary && (
        <a
          href={telHref(primary.number) ?? undefined}
          aria-disabled={!telHref(primary.number)}
          className={`mb-4 flex items-center justify-between rounded-xl border p-4 ${
            telHref(primary.number)
              ? "border-red-300 bg-red-50 hover:bg-red-100"
              : "border-slate-200 bg-slate-50 opacity-70 pointer-events-none"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <Siren className="h-4 w-4" /> 🚨 EMERGENCY
          </span>
          <span className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold tracking-wide text-white">
            {telHref(primary.number) ? "CALL EMERGENCY SERVICES" : "NOT CONFIGURED"}
          </span>
        </a>
      )}

      <div className="space-y-2">
        {rest.map((c) => {
          const href = telHref(c.number);
          return (
            <div
              key={c.category}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5"
            >
              <span className="text-sm text-slate-700">{c.label}</span>
              {href ? (
                <a
                  href={href}
                  className="flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700"
                >
                  <PhoneCall className="h-3 w-3" /> CALL
                </a>
              ) : (
                <span className="rounded-md border border-slate-200 px-3 py-1.5 text-[11px] text-slate-400">
                  Not configured
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
