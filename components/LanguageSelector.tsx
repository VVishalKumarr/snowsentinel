"use client";

import { Languages } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/lib/i18n";

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-1.5 ${compact ? "" : ""}`}>
      {!compact && <Languages className="h-3.5 w-3.5 text-slate-400" />}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-teal-400"
        aria-label="Language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
