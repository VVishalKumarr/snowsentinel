// emergencyData.ts — demo/synthetic data for the emergency-response layer.
// Everything here is fictional and labeled DEMO in the UI. Data shapes are
// designed so a real shelter registry, places API, or dispatch system can
// be swapped in without changing component code — see each list's comment.
// Shelters/services/ambulances are keyed by region so switching regions in
// the dashboard shows genuinely different, geographically appropriate data.

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
const SHELTERS_BY_REGION: Record<string, Shelter[]> = {
  khumbu: [
    { id: "khumbu-sh1", name: "Mountain Community Center (Demo)", position: [27.868, 86.803], distanceKm: 1.8, capacity: 500, occupied: 312, accessibility: "Wheelchair accessible, ground-floor sleeping area", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-sh2", name: "Valley Relief Shelter (Demo)", position: [27.833, 86.774], distanceKm: 3.9, capacity: 300, occupied: 300, accessibility: "Stairs only, no wheelchair access", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-sh3", name: "Sherpani Community Hall (Demo)", position: [27.803, 86.744], distanceKm: 7.6, capacity: 220, occupied: 40, accessibility: "Wheelchair accessible", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-sh4", name: "Ridge Transit Shelter (Demo)", position: [27.878, 86.81], distanceKm: 0.9, capacity: 150, occupied: 0, accessibility: "Stairs only", isOpen: false, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-sh5", name: "Lower Basin School Shelter (Demo)", position: [27.79, 86.735], distanceKm: 8.4, capacity: 180, occupied: 25, accessibility: "Wheelchair accessible", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
  annapurna: [
    { id: "annapurna-sh1", name: "Sanctuary Community Center (Demo)", position: [28.472, 83.867], distanceKm: 1.8, capacity: 500, occupied: 312, accessibility: "Wheelchair accessible, ground-floor sleeping area", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-sh2", name: "Valley Relief Shelter (Demo)", position: [28.44, 83.855], distanceKm: 3.9, capacity: 300, occupied: 300, accessibility: "Stairs only, no wheelchair access", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-sh3", name: "Landruk Community Hall (Demo)", position: [28.418, 83.849], distanceKm: 7.6, capacity: 220, occupied: 40, accessibility: "Wheelchair accessible", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-sh4", name: "Ridge Transit Shelter (Demo)", position: [28.508, 83.879], distanceKm: 0.9, capacity: 150, occupied: 0, accessibility: "Stairs only", isOpen: false, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-sh5", name: "Lower Basin School Shelter (Demo)", position: [28.39, 83.815], distanceKm: 8.4, capacity: 180, occupied: 25, accessibility: "Wheelchair accessible", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
  langtang: [
    { id: "langtang-sh1", name: "Ridgeview Community Center (Demo)", position: [28.168, 85.536], distanceKm: 1.8, capacity: 500, occupied: 312, accessibility: "Wheelchair accessible, ground-floor sleeping area", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-sh2", name: "Valley Relief Shelter (Demo)", position: [28.14, 85.525], distanceKm: 3.9, capacity: 300, occupied: 300, accessibility: "Stairs only, no wheelchair access", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-sh3", name: "Highland Community Hall (Demo)", position: [28.132, 85.522], distanceKm: 7.6, capacity: 220, occupied: 40, accessibility: "Wheelchair accessible", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-sh4", name: "Ridge Transit Shelter (Demo)", position: [28.198, 85.546], distanceKm: 0.9, capacity: 150, occupied: 0, accessibility: "Stairs only", isOpen: false, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-sh5", name: "Lower Basin School Shelter (Demo)", position: [28.08, 85.5], distanceKm: 8.4, capacity: 180, occupied: 25, accessibility: "Wheelchair accessible", isOpen: true, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
};

export function getShelters(regionId: string): Shelter[] {
  return SHELTERS_BY_REGION[regionId] ?? [];
}

// ---------------------------------------------------------------------------
// Emergency services — replace with a live places/dispatch API per region.
// ---------------------------------------------------------------------------
const EMERGENCY_SERVICES_BY_REGION: Record<string, EmergencyService[]> = {
  khumbu: [
    { id: "khumbu-es1", name: "Khumbu Valley Hospital (Demo)", type: "hospital", position: [27.832, 86.771], distanceKm: 2.4, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es1b", name: "Namche Gateway Clinic (Demo)", type: "hospital", position: [27.85, 86.79], distanceKm: 3.6, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es1c", name: "Ridge Basic Health Unit (Demo)", type: "hospital", position: [27.87, 86.808], distanceKm: 1.2, status: "Open 8am-8pm", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es1d", name: "Dombuk Health Post (Demo)", type: "hospital", position: [27.828, 86.768], distanceKm: 4.0, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es1e", name: "Lower Basin Medical Center (Demo)", type: "hospital", position: [27.795, 86.73], distanceKm: 7.9, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es2", name: "Sherpani Gateway Police Post (Demo)", type: "police", position: [27.801, 86.741], distanceKm: 3.1, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es2b", name: "Valley Checkpoint Police Post (Demo)", type: "police", position: [27.84, 86.785], distanceKm: 3.9, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es2c", name: "Ridge Police Outpost (Demo)", type: "police", position: [27.875, 86.812], distanceKm: 1.5, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es2d", name: "Dombuk Police Post (Demo)", type: "police", position: [27.826, 86.765], distanceKm: 4.2, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es2e", name: "Lower Basin Police Station (Demo)", type: "police", position: [27.79, 86.728], distanceKm: 8.1, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es3", name: "Valley Fire & Rescue Post (Demo)", type: "fire", position: [27.845, 86.78], distanceKm: 4.7, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es3b", name: "Ridge Fire & Rescue Post (Demo)", type: "fire", position: [27.872, 86.805], distanceKm: 1.4, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es3c", name: "Lower Basin Fire Station (Demo)", type: "fire", position: [27.798, 86.733], distanceKm: 7.7, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "khumbu-es4", name: "Khumbu Emergency Response Center (Demo)", type: "response_center", position: [27.83, 86.77], distanceKm: 3.5, status: "Operational", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
  annapurna: [
    { id: "annapurna-es1", name: "Annapurna Valley Hospital (Demo)", type: "hospital", position: [28.465, 83.862], distanceKm: 2.4, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es1b", name: "Sanctuary Gateway Clinic (Demo)", type: "hospital", position: [28.5, 83.878], distanceKm: 3.6, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es1c", name: "Ridge Basic Health Unit (Demo)", type: "hospital", position: [28.508, 83.879], distanceKm: 1.2, status: "Open 8am-8pm", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es1d", name: "Sinuwa Health Post (Demo)", type: "hospital", position: [28.462, 83.86], distanceKm: 4.0, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es1e", name: "Lower Basin Medical Center (Demo)", type: "hospital", position: [28.385, 83.812], distanceKm: 7.9, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es2", name: "Landruk Gateway Police Post (Demo)", type: "police", position: [28.418, 83.849], distanceKm: 3.1, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es2b", name: "Valley Checkpoint Police Post (Demo)", type: "police", position: [28.45, 83.865], distanceKm: 3.9, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es2c", name: "Ridge Police Outpost (Demo)", type: "police", position: [28.505, 83.877], distanceKm: 1.5, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es2d", name: "Sinuwa Police Post (Demo)", type: "police", position: [28.46, 83.857], distanceKm: 4.2, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es2e", name: "Lower Basin Police Station (Demo)", type: "police", position: [28.38, 83.808], distanceKm: 8.1, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es3", name: "Valley Fire & Rescue Post (Demo)", type: "fire", position: [28.46, 83.86], distanceKm: 4.7, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es3b", name: "Ridge Fire & Rescue Post (Demo)", type: "fire", position: [28.506, 83.876], distanceKm: 1.4, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es3c", name: "Lower Basin Fire Station (Demo)", type: "fire", position: [28.388, 83.81], distanceKm: 7.7, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "annapurna-es4", name: "Annapurna Emergency Response Center (Demo)", type: "response_center", position: [28.47, 83.865], distanceKm: 3.5, status: "Operational", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
  langtang: [
    { id: "langtang-es1", name: "Langtang Valley Hospital (Demo)", type: "hospital", position: [28.16, 85.532], distanceKm: 2.4, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es1b", name: "Ridgeview Gateway Clinic (Demo)", type: "hospital", position: [28.19, 85.545], distanceKm: 3.6, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es1c", name: "Ridge Basic Health Unit (Demo)", type: "hospital", position: [28.198, 85.546], distanceKm: 1.2, status: "Open 8am-8pm", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es1d", name: "River Junction Health Post (Demo)", type: "hospital", position: [28.158, 85.529], distanceKm: 4.0, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es1e", name: "Lower Basin Medical Center (Demo)", type: "hospital", position: [28.078, 85.497], distanceKm: 7.9, status: "Open 24/7", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es2", name: "Highland Gateway Police Post (Demo)", type: "police", position: [28.132, 85.522], distanceKm: 3.1, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es2b", name: "Valley Checkpoint Police Post (Demo)", type: "police", position: [28.16, 85.535], distanceKm: 3.9, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es2c", name: "Ridge Police Outpost (Demo)", type: "police", position: [28.195, 85.547], distanceKm: 1.5, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es2d", name: "River Junction Police Post (Demo)", type: "police", position: [28.156, 85.527], distanceKm: 4.2, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es2e", name: "Lower Basin Police Station (Demo)", type: "police", position: [28.075, 85.495], distanceKm: 8.1, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es3", name: "Valley Fire & Rescue Post (Demo)", type: "fire", position: [28.155, 85.53], distanceKm: 4.7, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es3b", name: "Ridge Fire & Rescue Post (Demo)", type: "fire", position: [28.196, 85.544], distanceKm: 1.4, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es3c", name: "Lower Basin Fire Station (Demo)", type: "fire", position: [28.08, 85.5], distanceKm: 7.7, status: "Staffed", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "langtang-es4", name: "Langtang Emergency Response Center (Demo)", type: "response_center", position: [28.16, 85.533], distanceKm: 3.5, status: "Operational", lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
};

export function getEmergencyServices(regionId: string): EmergencyService[] {
  return EMERGENCY_SERVICES_BY_REGION[regionId] ?? [];
}

// ---------------------------------------------------------------------------
// Ambulances — replace with a live dispatch feed. AVAILABLE count drives the
// overview stat automatically (not hardcoded).
// ---------------------------------------------------------------------------
const AMBULANCES_BY_REGION: Record<string, Ambulance[]> = {
  khumbu: [
    { id: "A-104", name: "Ambulance A-104", position: [27.834, 86.773], distanceKm: 1.6, status: "AVAILABLE", etaMinutes: 7, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-118", name: "Ambulance A-118", position: [27.85, 86.79], distanceKm: 4.2, status: "EN_ROUTE", etaMinutes: 15, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-122", name: "Ambulance A-122", position: [27.81, 86.75], distanceKm: 6.0, status: "AVAILABLE", etaMinutes: 12, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-131", name: "Ambulance A-131", position: [27.875, 86.808], distanceKm: 1.1, status: "AVAILABLE", etaMinutes: 5, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-145", name: "Ambulance A-145", position: [27.795, 86.732], distanceKm: 7.8, status: "UNAVAILABLE", etaMinutes: 22, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
  annapurna: [
    { id: "A-204", name: "Ambulance A-204", position: [28.467, 83.863], distanceKm: 1.6, status: "AVAILABLE", etaMinutes: 7, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-218", name: "Ambulance A-218", position: [28.5, 83.878], distanceKm: 4.2, status: "EN_ROUTE", etaMinutes: 15, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-222", name: "Ambulance A-222", position: [28.43, 83.85], distanceKm: 6.0, status: "AVAILABLE", etaMinutes: 12, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-231", name: "Ambulance A-231", position: [28.506, 83.877], distanceKm: 1.1, status: "AVAILABLE", etaMinutes: 5, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-245", name: "Ambulance A-245", position: [28.386, 83.811], distanceKm: 7.8, status: "UNAVAILABLE", etaMinutes: 22, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
  langtang: [
    { id: "A-304", name: "Ambulance A-304", position: [28.162, 85.533], distanceKm: 1.6, status: "AVAILABLE", etaMinutes: 7, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-318", name: "Ambulance A-318", position: [28.19, 85.545], distanceKm: 4.2, status: "EN_ROUTE", etaMinutes: 15, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-322", name: "Ambulance A-322", position: [28.14, 85.52], distanceKm: 6.0, status: "AVAILABLE", etaMinutes: 12, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-331", name: "Ambulance A-331", position: [28.196, 85.546], distanceKm: 1.1, status: "AVAILABLE", etaMinutes: 5, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
    { id: "A-345", name: "Ambulance A-345", position: [28.078, 85.498], distanceKm: 7.8, status: "UNAVAILABLE", etaMinutes: 22, lastSynced: DEMO_SYNC_TIME, source: "DEMO" },
  ],
};

export function getAmbulances(regionId: string): Ambulance[] {
  return AMBULANCES_BY_REGION[regionId] ?? [];
}

// ---------------------------------------------------------------------------
// Volunteers — anonymous IDs only, no exact location exposed, per privacy
// requirement. Area names are generic (not tied to one region's geography),
// so the same pool applies regardless of selected region. Replace with a
// verified volunteer registry.
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

export const VOLUNTEERS: Volunteer[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `V-0${21 + i}`,
  area: VOLUNTEER_AREAS[i % VOLUNTEER_AREAS.length],
  skills: VOLUNTEER_SKILL_SETS[i % VOLUNTEER_SKILL_SETS.length],
  status: i < 10 ? "AVAILABLE" : i === 10 ? "DEPLOYED" : "OFFLINE",
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
