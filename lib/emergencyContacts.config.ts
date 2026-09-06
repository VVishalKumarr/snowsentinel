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
//
// Labels/descriptions are TranslationKey references (see lib/i18n/en.ts) so
// the helpline UI renders in whichever language the user has selected —
// only the phone numbers themselves stay untranslated.

import type { EmergencyContactConfig } from "./emergencyTypes";

export const emergencyContacts: EmergencyContactConfig[] = [
  {
    category: "Emergency",
    number: "112",
    labelKey: "contactNationalEmergency",
    descriptionKey: "contactNationalEmergencyDesc",
    emoji: "🚨",
  },
  {
    category: "Police",
    number: "112",
    labelKey: "contactPolice",
    descriptionKey: "contactPoliceDesc",
    emoji: "👮",
  },
  {
    category: "Fire Brigade",
    number: "101",
    labelKey: "contactFireBrigade",
    emoji: "🔥",
  },
  {
    category: "Ambulance",
    number: "108",
    labelKey: "contactAmbulance",
    descriptionKey: "contactAmbulanceDesc",
    emoji: "🚑",
  },
  {
    category: "Ambulance / Patient Transport",
    number: "102",
    labelKey: "contactAmbulanceTransport",
    descriptionKey: "contactAmbulanceTransportDesc",
    emoji: "🚑",
  },
  {
    category: "Disaster Management",
    number: "1078",
    labelKey: "contactDisasterManagement",
    descriptionKey: "contactDisasterManagementDesc",
    emoji: "🏛",
  },
  {
    category: "NDMA Control Room",
    number: "011-26701728",
    labelKey: "contactNdmaControlRoom",
    descriptionKey: "contactNdmaControlRoomDesc",
    emoji: "🏛",
  },
  {
    category: "Women Helpline",
    number: "181",
    labelKey: "contactWomenHelpline",
    emoji: "🆘",
  },
  {
    category: "Cyber Crime",
    number: "1930",
    labelKey: "contactCyberCrime",
    emoji: "💻",
  },
  {
    category: "Child Helpline",
    number: "1098",
    labelKey: "contactChildHelpline",
    emoji: "🧒",
  },
];

export function telHref(number: string): string | null {
  const cleaned = number.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}
