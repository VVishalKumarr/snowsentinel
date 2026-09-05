// emergencyContacts.config.ts — fill in official, verified local emergency
// numbers for your deployment region here. SnowSentinel does NOT invent or
// assume real emergency numbers for any country. Until this file is
// configured, the UI shows "Not configured" instead of a guessed number.
//
// Example (Nepal-style placeholder — VERIFY before relying on this in any
// real deployment):
//   { category: "Emergency", number: "100", label: "Nepal Police" }

import type { EmergencyContactConfig } from "./emergencyTypes";

export const emergencyContacts: EmergencyContactConfig[] = [
  { category: "Emergency", number: "", label: "Emergency Services" },
  { category: "Police", number: "", label: "Police" },
  { category: "Fire Brigade", number: "", label: "Fire Brigade" },
  { category: "Medical Emergency", number: "", label: "Medical Emergency" },
  { category: "Disaster Management", number: "", label: "Disaster Management Authority" },
  { category: "Local Emergency Authority", number: "", label: "Local Emergency Authority (Demo Region)" },
];

export function telHref(number: string): string | null {
  const cleaned = number.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}
