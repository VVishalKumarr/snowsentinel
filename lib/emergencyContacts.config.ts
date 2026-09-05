// emergencyContacts.config.ts — verified national emergency numbers for
// India. Source: India's national single emergency number (112) is
// operated under the Emergency Response Support System (ERSS); 101/102/108
// are the pre-existing fire/ambulance numbers still in wide use alongside
// 112; 1078 is the National Disaster Management Authority (NDMA) control
// room line. See https://ndma.gov.in and https://dot.gov.in for reference.
//
// These are NATIONAL numbers. Some states/UTs route calls differently or
// have additional local lines — always verify with local authorities for
// anything beyond a demo. To configure a different country, replace the
// entries below; leave `number` empty to show "Not configured" instead of
// guessing.

import type { EmergencyContactConfig } from "./emergencyTypes";

export const emergencyContacts: EmergencyContactConfig[] = [
  {
    category: "Emergency",
    number: "112",
    label: "National Emergency",
    description: "Police / Fire / Medical emergency — India's single emergency number (ERSS)",
    emoji: "🚨",
  },
  {
    category: "Police",
    number: "112",
    label: "Police",
    description: "Routed through the National Emergency Number",
    emoji: "👮",
  },
  {
    category: "Fire Brigade",
    number: "101",
    label: "Fire Brigade",
    emoji: "🔥",
  },
  {
    category: "Ambulance",
    number: "108",
    label: "Ambulance",
    description: "Emergency ambulance service",
    emoji: "🚑",
  },
  {
    category: "Ambulance / Patient Transport",
    number: "102",
    label: "Ambulance / Patient Transport",
    description: "Non-emergency patient transport (availability varies by state)",
    emoji: "🚑",
  },
  {
    category: "Disaster Management",
    number: "1078",
    label: "Disaster Management",
    description: "NDMA — National Disaster Management Authority",
    emoji: "🏛",
  },
  {
    category: "NDMA Control Room",
    number: "011-26701728",
    label: "NDMA Control Room",
    description: "National Disaster Management Authority control room (landline)",
    emoji: "🏛",
  },
  {
    category: "Women Helpline",
    number: "181",
    label: "Women Helpline",
    emoji: "🆘",
  },
  {
    category: "Cyber Crime",
    number: "1930",
    label: "Cyber Crime",
    emoji: "💻",
  },
  {
    category: "Child Helpline",
    number: "1098",
    label: "Child Helpline",
    emoji: "🧒",
  },
];

export function telHref(number: string): string | null {
  const cleaned = number.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}
