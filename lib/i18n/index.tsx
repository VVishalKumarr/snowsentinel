"use client";

// i18n/index.ts — centralized translation system. Add a new UI string by
// adding the key to en.ts (the source of truth) then to every other file
// here — TypeScript's Record<TranslationKey, string> constraint on each
// file means a missing key is a build error, not a silent English fallback.
// Language choice persists to localStorage and works fully offline (no
// network fetch — the dictionaries are bundled).
//
// The dictionary/translate/isLanguageCode plumbing lives in ./shared.ts
// (no "use client") so server code can import it too — re-exported below
// so existing `from "@/lib/i18n"` imports keep working unchanged.

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { TranslationKey } from "./en";
import { LANGUAGES, DICTIONARIES, interpolate, type LanguageCode } from "./shared";

export { LANGUAGES, translate, isLanguageCode, type LanguageCode } from "./shared";

const STORAGE_KEY = "snowsentinel:language";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored && stored in DICTIONARIES) setLanguageState(stored);
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const value = useMemo<LanguageContextValue>(() => {
    const dict = DICTIONARIES[language];
    return {
      language,
      setLanguage,
      t: (key: TranslationKey, vars?: Record<string, string | number>) =>
        interpolate(dict[key] ?? DICTIONARIES.en[key] ?? key, vars),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
