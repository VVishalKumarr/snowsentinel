// hazardAlerts.ts — the real, persisted hazard-alert event the Demo Hazard
// Control Panel creates (and, in principle, a future real detection
// pipeline could create too — nothing here is demo-specific except the
// `isDemo` flag and who's allowed to call createHazardAlert). This is the
// single backend event the push fan-out to web + Android is built from.
//
// AFFECTED USERS: a user is considered affected if their last self-reported
// region (set only when they opt in via the existing location-alert flow)
// matches the alert's region, OR if they haven't reported one at all — we
// never silently exclude someone just because we don't know where they
// are, which would be the wrong default for an emergency broadcast. This
// is a coarse, region-level match, not fine-grained GPS filtering, and
// never exposes one user's location to another.

import { sql, ensureSchema } from "./db";
import type { HazardType, AlertLevel } from "./alertLevels";
import type { CrowdDensity } from "./crowdDensity";

export interface HazardAlert {
  id: number;
  createdBy: number | null;
  hazardType: HazardType;
  alertLevel: AlertLevel;
  regionId: string;
  countdownSeconds: number | null;
  crowdDensity: CrowdDensity | null;
  isDemo: boolean;
  createdAt: string;
}

interface HazardAlertRow {
  id: number;
  created_by: number | null;
  hazard_type: HazardType;
  alert_level: AlertLevel;
  region_id: string;
  countdown_seconds: number | null;
  crowd_density: CrowdDensity | null;
  is_demo: boolean;
  created_at: string;
}

function mapRow(r: HazardAlertRow): HazardAlert {
  return {
    id: r.id,
    createdBy: r.created_by,
    hazardType: r.hazard_type,
    alertLevel: r.alert_level,
    regionId: r.region_id,
    countdownSeconds: r.countdown_seconds,
    crowdDensity: r.crowd_density,
    isDemo: r.is_demo,
    createdAt: r.created_at,
  };
}

export async function createHazardAlert(
  createdBy: number | null,
  params: {
    hazardType: HazardType;
    alertLevel: AlertLevel;
    regionId: string;
    countdownSeconds: number | null;
    crowdDensity: CrowdDensity | null;
    isDemo: boolean;
  }
): Promise<{ alert: HazardAlert; recipientUserIds: number[] }> {
  await ensureSchema();

  const { rows } = await sql<HazardAlertRow>`
    INSERT INTO hazard_alerts (created_by, hazard_type, alert_level, region_id, countdown_seconds, crowd_density, is_demo)
    VALUES (${createdBy}, ${params.hazardType}, ${params.alertLevel}, ${params.regionId}, ${params.countdownSeconds}, ${params.crowdDensity}, ${params.isDemo})
    RETURNING *
  `;
  const alert = mapRow(rows[0]);

  const { rows: userRows } = await sql<{ id: number }>`
    SELECT id FROM users WHERE last_region_id = ${params.regionId} OR last_region_id IS NULL
  `;
  const recipientUserIds = userRows.map((r) => r.id);

  for (const uid of recipientUserIds) {
    await sql`
      INSERT INTO hazard_alert_recipients (hazard_alert_id, user_id)
      VALUES (${alert.id}, ${uid})
      ON CONFLICT (hazard_alert_id, user_id) DO NOTHING
    `;
  }

  return { alert, recipientUserIds };
}

export async function markHazardAlertDelivered(hazardAlertId: number, userIds: number[]): Promise<void> {
  await ensureSchema();
  if (userIds.length === 0) return;
  await sql`
    UPDATE hazard_alert_recipients
    SET delivered = TRUE
    WHERE hazard_alert_id = ${hazardAlertId} AND user_id = ANY(${userIds as unknown as number})
  `;
}

// "Active" = created recently enough that its DEMO PREDICTION countdown
// could plausibly still be running — a generous fixed window rather than
// reading each alert's own countdown_seconds, so a "no prediction" (LOW)
// alert is still findable shortly after being created.
const ACTIVE_WINDOW = "6 hours";

export async function getLatestActiveHazardAlert(regionId: string | null): Promise<HazardAlert | null> {
  await ensureSchema();
  const { rows } = regionId
    ? await sql<HazardAlertRow>`
        SELECT * FROM hazard_alerts
        WHERE created_at > now() - ${ACTIVE_WINDOW}::interval AND region_id = ${regionId}
        ORDER BY created_at DESC LIMIT 1
      `
    : await sql<HazardAlertRow>`
        SELECT * FROM hazard_alerts
        WHERE created_at > now() - ${ACTIVE_WINDOW}::interval
        ORDER BY created_at DESC LIMIT 1
      `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getHazardAlertById(id: number): Promise<HazardAlert | null> {
  await ensureSchema();
  const { rows } = await sql<HazardAlertRow>`SELECT * FROM hazard_alerts WHERE id = ${id}`;
  return rows[0] ? mapRow(rows[0]) : null;
}
