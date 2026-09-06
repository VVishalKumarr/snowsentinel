"use client";

import { PhoneCall, Siren, Info } from "lucide-react";
import { emergencyContacts, telHref } from "@/lib/emergencyContacts.config";
import { useLanguage } from "@/lib/i18n";

export default function HelplineSection() {
  const { t } = useLanguage();
  const primary = emergencyContacts.find((c) => c.category === "Emergency");
  const rest = emergencyContacts.filter((c) => c.category !== "Emergency");

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <h2 className="mb-1 text-sm font-semibold tracking-wide text-slate-800">{t("helplineTitle")}</h2>
      <p className="mb-4 text-xs text-slate-500">
        {t("helplineDescription")}{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5">lib/emergencyContacts.config.ts</code>.
      </p>

      {primary && (
        <a
          href={telHref(primary.number) ?? undefined}
          aria-disabled={!telHref(primary.number)}
          className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4 ${
            telHref(primary.number)
              ? "border-red-300 bg-red-50 hover:bg-red-100"
              : "border-slate-200 bg-slate-50 opacity-70 pointer-events-none"
          }`}
        >
          <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-red-700">
            <Siren className="h-4 w-4 flex-shrink-0" /> {primary.emoji ?? "🚨"} {t(primary.labelKey).toUpperCase()}
            {primary.number && <span className="font-mono text-red-600">{primary.number}</span>}
          </span>
          <span className="flex-shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold tracking-wide text-white">
            {telHref(primary.number) ? t("call") : t("helplineNotConfigured")}
          </span>
        </a>
      )}

      <div className="space-y-2">
        {rest.map((c) => {
          const href = telHref(c.number);
          return (
            <div
              key={c.category}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
            >
              <div className="min-w-0">
                <span className="text-sm text-slate-700">
                  {c.emoji ? `${c.emoji} ` : ""}
                  {t(c.labelKey)}
                  {c.number && <span className="ml-2 font-mono text-xs text-slate-500">{c.number}</span>}
                </span>
                {c.descriptionKey && <p className="mt-0.5 text-[11px] text-slate-400">{t(c.descriptionKey)}</p>}
              </div>
              {href ? (
                <a
                  href={href}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700"
                >
                  <PhoneCall className="h-3 w-3" /> {t("call")}
                </a>
              ) : (
                <span className="flex-shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] text-slate-400">
                  {t("helplineNotConfigured")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[10px] text-slate-500">
        <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
        <span>{t("helplineSourceNote")}</span>
      </div>
    </div>
  );
}
