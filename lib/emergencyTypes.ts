// emergencyTypes.ts — data model for the emergency-response layer built
// around the existing satellite/hazard/risk system. All records here are
// demo/synthetic unless explicitly wired to a live source — see
// lib/emergencyData.ts and each feature's "DEMO DATA" labeling in the UI.

import type { TranslationKey } from "./i18n/en";

export type SyncStatus = "LIVE" | "DEMO" | "CACHED";

export interface MountainRegion {
  id: string;
  name: string;
  center: [number, number];
}

export type AccessibilityCode =
  | "WHEELCHAIR_GROUND_FLOOR"
  | "STAIRS_ONLY"
  | "WHEELCHAIR_ACCESSIBLE"
  | "STAIRS_ONLY_NO_WHEELCHAIR";

export interface Shelter {
  id: string;
  name: string;
  position: [number, number];
  distanceKm: number;
  capacity: number;
  occupied: number;
  accessibility: AccessibilityCode;
  isOpen: boolean;
  lastSynced: string;
  source: SyncStatus;
}

export type EmergencyServiceType = "hospital" | "police" | "fire" | "ambulance" | "response_center";
export type EmergencyServiceStatus = "OPEN_24_7" | "OPEN_8_TO_8" | "STAFFED" | "OPERATIONAL";

export interface EmergencyService {
  id: string;
  name: string;
  type: EmergencyServiceType;
  position: [number, number];
  distanceKm: number;
  status?: EmergencyServiceStatus;
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
  | "FIRST_AID"
  | "SEARCH_RESCUE"
  | "TRANSPORT"
  | "FOOD"
  | "LOGISTICS"
  | "TRANSLATION"
  | "SHELTER_SUPPORT";

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
  labelKey: TranslationKey;
  descriptionKey?: TranslationKey;
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
  populationExposure: "HIGH" | "MODERATE" | "LOW";
  nearestShelterKm: number;
  nearestHospitalKm: number;
  roadAccessible: boolean;
  recommendedResponse: string;
}

export const PRIORITY_LABEL_KEY: Record<PriorityLevel, TranslationKey> = {
  1: "priorityLabel1",
  2: "priorityLabel2",
  3: "priorityLabel3",
  4: "priorityLabel4",
};
