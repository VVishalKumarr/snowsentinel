import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { createHazardAlert, markHazardAlertDelivered } from "@/lib/hazardAlerts";
import { sendPushToUsers } from "@/lib/pushService";
import { HAZARD_TYPE_LABEL_KEY, ALERT_LEVEL_MESSAGE_KEY, type HazardType, type AlertLevel } from "@/lib/alertLevels";
import type { CrowdDensity } from "@/lib/crowdDensity";
import { REGIONS } from "@/lib/demoData";
import type { TranslationKey } from "@/lib/i18n/en";

const VALID_HAZARD_TYPES: HazardType[] = ["AVALANCHE", "FLOOD", "LANDSLIDE", "EARTHQUAKE", "SEVERE_WEATHER"];
const VALID_ALERT_LEVELS: AlertLevel[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];
const VALID_CROWD_DENSITIES: CrowdDensity[] = ["LOW", "MODERATE", "HIGH", "VERY_HIGH"];

const HAZARD_PUSH_TITLE_KEY: Partial<Record<AlertLevel, TranslationKey>> = {
  MODERATE: "pushHazardTitleModerate",
  HIGH: "pushHazardTitleHigh",
  CRITICAL: "pushHazardTitleCritical",
};

// This is the "real backend event" the Demo Hazard Control Panel drives —
// see lib/hazardAlerts.ts for how affected recipients are determined, and
// lib/pushService.ts for how each one is actually reached (FCM/Web Push,
// rendered in their own saved language). A LOW alert is still recorded and
// picked up by clients polling /api/hazard-alerts/latest (so the website's
// risk countdown/crowd-density panels update), but per the alert-level
// spec it does not send a push notification — see "ALERT NOTIFICATIONS
// BASED ON ALERT LEVEL" from the original feature request.
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const hazardType = body.hazardType as HazardType;
  const alertLevel = body.alertLevel as AlertLevel;
  const regionId = String(body.regionId ?? "");
  const countdownSeconds = Number.isFinite(Number(body.countdownSeconds)) ? Number(body.countdownSeconds) : null;
  const crowdDensity: CrowdDensity | null = VALID_CROWD_DENSITIES.includes(body.crowdDensity) ? body.crowdDensity : null;

  if (!VALID_HAZARD_TYPES.includes(hazardType) || !VALID_ALERT_LEVELS.includes(alertLevel) || !REGIONS.some((r) => r.id === regionId)) {
    return NextResponse.json({ error: "hazardType, alertLevel, and a valid regionId are required" }, { status: 400 });
  }

  const { alert, recipientUserIds } = await createHazardAlert(user.id, {
    hazardType,
    alertLevel,
    regionId,
    countdownSeconds,
    crowdDensity,
    isDemo: true,
  });

  let deliveredCount = 0;
  const titleKey = HAZARD_PUSH_TITLE_KEY[alertLevel];
  const bodyKey = ALERT_LEVEL_MESSAGE_KEY[alertLevel];
  if (titleKey && bodyKey) {
    const region = REGIONS.find((r) => r.id === regionId);
    const results = await sendPushToUsers(recipientUserIds, {
      channel: alertLevel === "CRITICAL" ? "CRITICAL_ALERTS" : "HIGH_ALERTS",
      titleKey,
      bodyKey,
      data: { type: "hazard", alertId: String(alert.id), alertLevel, hazardType },
    });
    const deliveredUserIds = results.filter((r) => r.delivered > 0).map((r) => r.userId);
    deliveredCount = deliveredUserIds.length;
    await markHazardAlertDelivered(alert.id, deliveredUserIds);
  }

  return NextResponse.json({
    success: true,
    alert: { ...alert, hazardTypeLabelKey: HAZARD_TYPE_LABEL_KEY[hazardType] },
    notifiedCount: recipientUserIds.length,
    deliveredCount,
  });
}
