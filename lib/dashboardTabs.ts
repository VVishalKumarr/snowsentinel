import type { TranslationKey } from "./i18n/en";

export type DashboardTab =
  | "overview"
  | "satellite"
  | "risk"
  | "impact"
  | "help"
  | "shelters"
  | "family"
  | "emergency";

export const DASHBOARD_TABS: { id: DashboardTab; labelKey: TranslationKey }[] = [
  { id: "overview", labelKey: "tabOverview" },
  { id: "satellite", labelKey: "tabSatellite" },
  { id: "risk", labelKey: "tabRisk" },
  { id: "impact", labelKey: "tabImpact" },
  { id: "help", labelKey: "tabHelp" },
  { id: "shelters", labelKey: "tabShelters" },
  { id: "family", labelKey: "tabFamily" },
  { id: "emergency", labelKey: "tabEmergency" },
];
