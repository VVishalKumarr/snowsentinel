// emergencyTypes.ts — data model for the emergency-response layer built
// around the existing satellite/hazard/risk system. All records here are
// demo/synthetic unless explicitly wired to a live source — see
// lib/emergencyData.ts and each feature's "DEMO DATA" labeling in the UI.

export type SyncStatus = "LIVE" | "DEMO" | "CACHED";

export interface MountainRegion {
  id: string;
  name: string;
  center: [number, number];
}

export interface Shelter {
  id: string;
  name: string;
  position: [number, number];
  distanceKm: number;
  capacity: number;
  occupied: number;
  accessibility: string;
  isOpen: boolean;
  lastSynced: string;
  source: SyncStatus;
}

export type EmergencyServiceType = "hospital" | "police" | "fire" | "ambulance" | "response_center";

export interface EmergencyService {
  id: string;
  name: string;
  type: EmergencyServiceType;
  position: [number, number];
  distanceKm: number;
  status?: string;
  phone?: string;
  lastSynced: string;
  source: SyncStatus;
}

export type AmbulanceStatus = "AVAILABLE" | "EN_ROUTE" | "UNAVAILABLE";

export interface Ambulance {
  id: string;
  name: string;
  position: [number, number];
  distanceKm: number;
  status: AmbulanceStatus;
  etaMinutes: number;
  lastSynced: string;
  source: SyncStatus;
}

export type VolunteerSkill =
  | "First Aid"
  | "Search & Rescue"
  | "Transport"
  | "Food"
  | "Logistics"
  | "Translation"
  | "Shelter Support";

export interface Volunteer {
  id: string;
  area: string;
  skills: VolunteerSkill[];
  status: "AVAILABLE" | "DEPLOYED" | "OFFLINE";
}

export type SafetyStatus = "SAFE" | "CHECK_IN_REQUESTED" | "NEEDS_HELP" | "NOT_CHECKED_IN";

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  contactMethod: string;
  status: SafetyStatus;
  lastCheckIn: string; // ISO timestamp
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  contactMethod: string; // phone number or handle
}

export interface EmergencyContactConfig {
  category: string;
  number: string;
  label: string;
  description?: string;
  emoji?: string;
}

export type AlertType = "INFO" | "WATCH" | "WARNING" | "CRITICAL";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  what: string;
  where: string;
  why: string;
  impact: string;
  action: string;
  source: string;
  confidence: "LOW" | "MODERATE" | "HIGH";
  createdAt: string;
  acknowledged: boolean;
}

export type SOSStatus = "SENT" | "QUEUED" | "FAILED";

export interface SOSRequest {
  id: string;
  createdAt: string;
  status: SOSStatus;
  recipientIds: string[];
  location: { lat: number; lng: number } | null;
  message: string;
}

export type PriorityLevel = 1 | 2 | 3 | 4;

export interface PriorityZone {
  id: string;
  level: PriorityLevel;
  settlementId: string;
  settlementName: string;
  risk: "HIGH" | "MODERATE" | "LOW";
  populationExposure: "High" | "Moderate" | "Low";
  nearestShelterKm: number;
  nearestHospitalKm: number;
  roadAccessible: boolean;
  recommendedResponse: string;
}

export const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  1: "PRIORITY 1 — Immediate attention",
  2: "PRIORITY 2 — High monitoring",
  3: "PRIORITY 3 — Preparedness",
  4: "LOWER PRIORITY",
};
