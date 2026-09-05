// emergencyData.ts — demo/synthetic data for the emergency-response layer.
// Everything here is fictional and labeled DEMO in the UI. Data shapes are
// designed so a real shelter registry, places API, or dispatch system can
// be swapped in without changing component code — see each list's comment.

import type {
  Shelter,
  EmergencyService,
  Ambulance,
  Volunteer,
  FamilyMember,
  PriorityZone,
  Alert,
} from "./emergencyTypes";
import type { HazardScenario } from "./types";

export const DEMO_SYNC_TIME = "04 Sep 2026, 14:20";

export function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function minutesAgoISO(mins: number): string {
  return new Date(Date.now() - mins * 60000).toISOString();
}

// ---------------------------------------------------------------------------
// Shelters — replace with a real shelter registry / CAP feed keyed by region.
// ---------------------------------------------------------------------------
export const SHELTERS: Shelter[] = [
  {
    id: "sh1",
    name: "Mountain Community Center (Demo)",
    position: [27.868, 86.803],
    distanceKm: 1.8,
    capacity: 500,
    occupied: 312,
    accessibility: "Wheelchair accessible, ground-floor sleeping area",
    isOpen: true,
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
  {
    id: "sh2",
    name: "Valley Relief Shelter (Demo)",
    position: [27.833, 86.774],
    distanceKm: 3.9,
    capacity: 300,
    occupied: 300,
    accessibility: "Stairs only, no wheelchair access",
    isOpen: true,
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
  {
    id: "sh3",
    name: "Sherpani Community Hall (Demo)",
    position: [27.803, 86.744],
    distanceKm: 7.6,
    capacity: 220,
    occupied: 40,
    accessibility: "Wheelchair accessible",
    isOpen: true,
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
  {
    id: "sh4",
    name: "Ridge Transit Shelter (Demo)",
    position: [27.878, 86.81],
    distanceKm: 0.9,
    capacity: 150,
    occupied: 0,
    accessibility: "Stairs only",
    isOpen: false,
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
];

// ---------------------------------------------------------------------------
// Emergency services — replace with a live places/dispatch API per region.
// ---------------------------------------------------------------------------
export const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    id: "es1",
    name: "Khumbu Valley Hospital (Demo)",
    type: "hospital",
    position: [27.832, 86.771],
    distanceKm: 2.4,
    status: "Open 24/7",
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
  {
    id: "es2",
    name: "Sherpani Gateway Police Post (Demo)",
    type: "police",
    position: [27.801, 86.741],
    distanceKm: 3.1,
    status: "Staffed",
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
  {
    id: "es3",
    name: "Valley Fire & Rescue Post (Demo)",
    type: "fire",
    position: [27.845, 86.78],
    distanceKm: 4.7,
    status: "Staffed",
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
  {
    id: "es4",
    name: "Khumbu Emergency Response Center (Demo)",
    type: "response_center",
    position: [27.83, 86.77],
    distanceKm: 3.5,
    status: "Operational",
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
];

// ---------------------------------------------------------------------------
// Ambulances — replace with a live dispatch feed. AVAILABLE count drives the
// overview stat automatically (not hardcoded).
// ---------------------------------------------------------------------------
export const AMBULANCES: Ambulance[] = [
  {
    id: "A-104",
    name: "Ambulance A-104",
    position: [27.834, 86.773],
    distanceKm: 1.6,
    status: "AVAILABLE",
    etaMinutes: 7,
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
  {
    id: "A-118",
    name: "Ambulance A-118",
    position: [27.85, 86.79],
    distanceKm: 4.2,
    status: "EN_ROUTE",
    etaMinutes: 15,
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
  {
    id: "A-122",
    name: "Ambulance A-122",
    position: [27.81, 86.75],
    distanceKm: 6.0,
    status: "AVAILABLE",
    etaMinutes: 12,
    lastSynced: DEMO_SYNC_TIME,
    source: "DEMO",
  },
];

// ---------------------------------------------------------------------------
// Volunteers — anonymous IDs only, no exact location exposed, per privacy
// requirement. Replace with a verified volunteer registry.
// ---------------------------------------------------------------------------
const VOLUNTEER_AREAS = ["Valley North", "Valley East", "Valley South", "Ridge West", "Basecamp Sector"];
const VOLUNTEER_SKILL_SETS: Volunteer["skills"][] = [
  ["First Aid", "Search & Rescue"],
  ["Transport", "Logistics"],
  ["Food", "Shelter Support"],
  ["Translation"],
  ["First Aid"],
  ["Search & Rescue", "Logistics"],
  ["Shelter Support"],
];

export const VOLUNTEERS: Volunteer[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `V-0${21 + i}`,
  area: VOLUNTEER_AREAS[i % VOLUNTEER_AREAS.length],
  skills: VOLUNTEER_SKILL_SETS[i % VOLUNTEER_SKILL_SETS.length],
  status: i < 12 ? "AVAILABLE" : i === 12 ? "DEPLOYED" : "OFFLINE",
}));

// ---------------------------------------------------------------------------
// Family safety network — simulated locally, explicit consent, no real
// tracking. Seeded with the project team as the demo family group.
// ---------------------------------------------------------------------------
export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  { id: "f1", name: "Vishal", relationship: "You", contactMethod: "App", status: "SAFE", lastCheckIn: minutesAgoISO(10) },
  { id: "f2", name: "Aashiv", relationship: "Teammate", contactMethod: "Phone", status: "CHECK_IN_REQUESTED", lastCheckIn: minutesAgoISO(60) },
  { id: "f3", name: "Anhad", relationship: "Teammate", contactMethod: "Phone", status: "SAFE", lastCheckIn: minutesAgoISO(5) },
];

// ---------------------------------------------------------------------------
// Priority zones — derived from the existing settlement/risk data so this
// stays connected to the real hazard model instead of being a separate list.
// ---------------------------------------------------------------------------
export function buildPriorityZones(scenario: HazardScenario): PriorityZone[] {
  const exposureToLevel = { HIGH: 1, MODERATE: 2, LOW: 3 } as const;
  const exposureToPopulation = { HIGH: "High", MODERATE: "Moderate", LOW: "Low" } as const;

  return scenario.settlements.map((s, i) => ({
    id: `pz-${s.id}`,
    level: (scenario.risk.riskLevel === "LOW" ? 4 : exposureToLevel[s.exposure]) as PriorityZone["level"],
    settlementId: s.id,
    settlementName: s.name,
    risk: s.exposure,
    populationExposure: exposureToPopulation[s.exposure],
    nearestShelterKm: [1.8, 3.9, 7.6][i % 3],
    nearestHospitalKm: [2.4, 4.1, 6.8][i % 3],
    roadAccessible: s.exposure !== "HIGH",
    recommendedResponse:
      s.exposure === "HIGH"
        ? "Prioritize monitoring and preparedness; verify shelter readiness."
        : s.exposure === "MODERATE"
        ? "Maintain monitoring; confirm communication channels."
        : "Standard monitoring posture; no immediate action indicated.",
  }));
}

// ---------------------------------------------------------------------------
// Alerts — generated from the live-in-app hazard scenario so the alert copy
// never drifts from the actual risk data being shown elsewhere.
// ---------------------------------------------------------------------------
export function buildAlertForScenario(scenario: HazardScenario): Alert {
  const level = scenario.risk.riskLevel;
  const type = level === "HIGH" ? "CRITICAL" : level === "ELEVATED" ? "WARNING" : level === "MEDIUM" ? "WATCH" : "INFO";
  return {
    id: `alert-${scenario.id}`,
    type,
    title: level === "LOW" ? "Stable conditions" : "Hazard watch",
    what: `Snow/ice change of ${scenario.environmentalChange.snowIceChangePct}% observed vs. previous pass (+${scenario.environmentalChange.deltaFromPrevious}%).`,
    where: `${scenario.region.shortName} demo region — monitored source zone and downstream valley.`,
    why: `Combined snow/ice, environmental, historical, and terrain indicators produced an experimental risk score of ${scenario.risk.riskScore}/100.`,
    impact: `${scenario.simulatedStats.exposedSettlements} settlement(s) and ${scenario.simulatedStats.criticalInfrastructure} infrastructure point(s) fall within the simulated potential impact zone.`,
    action: level === "LOW" ? "Continue routine monitoring." : "Review preparedness actions in the Emergency tab; verify with official authorities.",
    source: "SnowSentinel experimental hazard-risk model (demo data)",
    confidence: level === "HIGH" || level === "ELEVATED" ? "MODERATE" : "LOW",
    createdAt: new Date().toISOString(),
    acknowledged: false,
  };
}
