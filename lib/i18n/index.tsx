"use client";

// i18n/index.ts — centralized translation system. Add a new UI string by
// adding the key to en.ts (the source of truth) then to every other file
// here — TypeScript's Record<TranslationKey, string> constraint on each
// file means a missing key is a build error, not a silent English fallback.
// Language choice persists to localStorage and works fully offline (no
// network fetch — the dictionaries are bundled).

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import en, { type TranslationKey } from "./en";
import hi from "./hi";
import ne from "./ne";
import bo from "./bo";

export type LanguageCode = "en" | "hi" | "ne" | "bo";

export const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ne", label: "नेपाली", flag: "🇳🇵" },
  { code: "bo", label: "བོད་ཡིག", flag: "🏔️" },
];

const DICTIONARIES: Record<LanguageCode, Record<TranslationKey, string>> = { en, hi, ne, bo };
const STORAGE_KEY = "snowsentinel:language";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
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

// Non-hook translation for server code and plain data modules (API routes,
// lib/ai.ts) that need a translated string but aren't React components.
export function translate(
  lang: LanguageCode,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[lang] ?? DICTIONARIES.en;
  return interpolate(dict[key] ?? DICTIONARIES.en[key] ?? key, vars);
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && value in DICTIONARIES;
}
