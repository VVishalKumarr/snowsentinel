"use client";

import { ShieldAlert } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

const STATEMENT_KEYS: TranslationKey[] = ["trust1", "trust2", "trust3", "trust4", "trust5"];

export default function TrustSection() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert className="h-4.5 w-4.5 text-amber-700" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold tracking-wide text-amber-900">{t("trustTitle")}</h2>
      </div>
      <ul className="space-y-1.5">
        {STATEMENT_KEYS.map((key) => (
          <li key={key} className="text-xs leading-relaxed text-amber-900/90">
            • {t(key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
