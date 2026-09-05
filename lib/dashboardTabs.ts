export type DashboardTab =
  | "overview"
  | "satellite"
  | "risk"
  | "impact"
  | "help"
  | "shelters"
  | "family"
  | "emergency";

export const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "overview", label: "OVERVIEW" },
  { id: "satellite", label: "SATELLITE" },
  { id: "risk", label: "RISK" },
  { id: "impact", label: "IMPACT MAP" },
  { id: "help", label: "NEARBY HELP" },
  { id: "shelters", label: "SHELTERS" },
  { id: "family", label: "FAMILY SAFETY" },
  { id: "emergency", label: "EMERGENCY" },
];
