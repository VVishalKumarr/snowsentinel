// shared.ts — the framework-agnostic half of the i18n system: the
// dictionary map, translate(), and isLanguageCode(). Deliberately has NO
// "use client" directive (unlike index.tsx) so server code — API routes,
// lib/pushService.ts, lib/ai.ts — can import it directly. index.tsx
// re-exports everything here so existing `from "@/lib/i18n"` imports keep
// working unchanged from client components.

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

export const DICTIONARIES: Record<LanguageCode, Record<TranslationKey, string>> = { en, hi, ne, bo };

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

// Non-hook translation for server code and plain data modules (API routes,
// lib/ai.ts, lib/pushService.ts) that need a translated string but aren't
// React components.
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
