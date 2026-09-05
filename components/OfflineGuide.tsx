"use client";

import { BookOpenText } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

const SECTIONS: { titleKey: TranslationKey; itemKeys: TranslationKey[] }[] = [
  { titleKey: "offlineBeforeTitle", itemKeys: ["offlineBefore1", "offlineBefore2", "offlineBefore3", "offlineBefore4"] },
  { titleKey: "offlineDuringTitle", itemKeys: ["offlineDuring1", "offlineDuring2", "offlineDuring3", "offlineDuring4"] },
  { titleKey: "offlineAfterTitle", itemKeys: ["offlineAfter1", "offlineAfter2", "offlineAfter3", "offlineAfter4"] },
];

export default function OfflineGuide() {
  const { t } = useLanguage();

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center gap-2">
        <BookOpenText className="h-4.5 w-4.5 text-teal-600" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">{t("offlineGuideTitle")}</h2>
      </div>
      <p className="mb-4 text-xs text-slate-500">{t("offlineGuideDescription")}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.titleKey} className="rounded-xl border border-slate-200 bg-white p-3">
            <h3 className="mb-2 text-xs font-semibold tracking-[0.08em] text-slate-600">{t(section.titleKey)}</h3>
            <ul className="space-y-1.5">
              {section.itemKeys.map((key) => (
                <li key={key} className="text-xs leading-relaxed text-slate-600">
                  • {t(key)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
