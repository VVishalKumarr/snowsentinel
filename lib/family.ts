// family.ts — query helpers for the family safety network. Each user has
// their own private network; a connection is only visible to its two
// participants. See AccessModel below for how "who watches whom" works.
//
// AccessModel: a family_connections row means "owner_user_id is watching
// family_member_user_id's safety status." When a request is accepted, we
// create BOTH directions (A watches B, and B watches A) so each side tracks
// the other independently — e.g. A can request a check-in from B without
// that action also (incorrectly) changing what B sees about A.

import { sql, ensureSchema, findUserByCode, type DbUser } from "./db";

export interface FamilyConnectionRow {
  id: number;
  owner_user_id: number;
  family_member_user_id: number;
  relationship: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  safety_status: "SAFE" | "CHECK_IN_REQUESTED" | "NEEDS_HELP" | "NOT_CHECKED_IN";
  share_location: boolean;
  last_location_lat: number | null;
  last_location_lng: number | null;
  created_at: string;
  last_check_in: string | null;
  check_in_requested_at: string | null;
}

export interface FamilyMemberView {
  connectionId: number;
  userId: number;
  name: string;
  uniqueCode: string;
  // Only ever populated for ACCEPTED connections — i.e. shown only to a
  // family member the user has mutually consented to connect with, never
  // in a pending-request preview. This is what lets SOS text/call them
  // directly; it is not exposed anywhere public.
  phoneNumber: string;
  relationship: string | null;
  safetyStatus: FamilyConnectionRow["safety_status"];
  lastCheckIn: string | null;
  checkInRequestedAt: string | null;
  shareLocation: boolean;
  location: { lat: number; lng: number } | null;
}

export async function listMyFamily(userId: number): Promise<FamilyMemberView[]> {
  await ensureSchema();
  const { rows } = await sql<FamilyConnectionRow & Pick<DbUser, "name" | "unique_code" | "phone_number">>`
    SELECT fc.*, u.name, u.unique_code, u.phone_number
    FROM family_connections fc
    JOIN users u ON u.id = fc.family_member_user_id
    WHERE fc.owner_user_id = ${userId} AND fc.status = 'ACCEPTED'
    ORDER BY fc.created_at ASC
  `;
  return rows.map(toFamilyMemberView);
}

export async function listPendingIncomingRequests(userId: number) {
  await ensureSchema();
  const { rows } = await sql<{ id: number; owner_user_id: number; relationship: string | null; created_at: string; name: string; unique_code: string }>`
    SELECT fc.id, fc.owner_user_id, fc.relationship, fc.created_at, u.name, u.unique_code
    FROM family_connections fc
    JOIN users u ON u.id = fc.owner_user_id
    WHERE fc.family_member_user_id = ${userId} AND fc.status = 'PENDING'
    ORDER BY fc.created_at ASC
  `;
  return rows.map((r) => ({
    connectionId: r.id,
    fromUserId: r.owner_user_id,
    fromName: r.name,
    fromCode: r.unique_code,
    relationship: r.relationship,
    createdAt: r.created_at,
  }));
}

export async function listIncomingCheckInRequests(userId: number) {
  await ensureSchema();
  const { rows } = await sql<{ id: number; owner_user_id: number; check_in_requested_at: string; name: string }>`
    SELECT fc.id, fc.owner_user_id, fc.check_in_requested_at, u.name
    FROM family_connections fc
    JOIN users u ON u.id = fc.owner_user_id
    WHERE fc.family_member_user_id = ${userId} AND fc.safety_status = 'CHECK_IN_REQUESTED'
    ORDER BY fc.check_in_requested_at DESC
  `;
  return rows.map((r) => ({
    connectionId: r.id,
    fromUserId: r.owner_user_id,
    fromName: r.name,
    requestedAt: r.check_in_requested_at,
  }));
}

export async function sendFamilyRequest(ownerUserId: number, code: string, relationship: string) {
  await ensureSchema();
  const target = await findUserByCode(code);
  if (!target) throw new UserFacingError("No user found with that code");
  if (target.id === ownerUserId) throw new UserFacingError("You can't add yourself");

  const existing = await sql<{ id: number; status: string }>`
    SELECT id, status FROM family_connections
    WHERE owner_user_id = ${ownerUserId} AND family_member_user_id = ${target.id}
  `;
  if (existing.rows.length > 0) {
    throw new UserFacingError(
      existing.rows[0].status === "ACCEPTED" ? "Already in your family network" : "Request already sent"
    );
  }

  await sql`
    INSERT INTO family_connections (owner_user_id, family_member_user_id, relationship, status)
    VALUES (${ownerUserId}, ${target.id}, ${relationship || null}, 'PENDING')
  `;
  return { name: target.name, uniqueCode: target.unique_code };
}

export async function respondToFamilyRequest(userId: number, connectionId: number, accept: boolean) {
  await ensureSchema();
  const { rows } = await sql<FamilyConnectionRow>`
    SELECT * FROM family_connections WHERE id = ${connectionId} AND family_member_user_id = ${userId}
  `;
  const conn = rows[0];
  if (!conn) throw new UserFacingError("Request not found");
  if (conn.status !== "PENDING") throw new UserFacingError("Request already handled");

  if (!accept) {
    await sql`UPDATE family_connections SET status = 'DECLINED' WHERE id = ${connectionId}`;
    return;
  }

  await sql`UPDATE family_connections SET status = 'ACCEPTED' WHERE id = ${connectionId}`;
  // Create the reverse direction so both sides track each other independently.
  const reverse = await sql<{ id: number }>`
    SELECT id FROM family_connections WHERE owner_user_id = ${userId} AND family_member_user_id = ${conn.owner_user_id}
  `;
  if (reverse.rows.length === 0) {
    await sql`
      INSERT INTO family_connections (owner_user_id, family_member_user_id, relationship, status)
      VALUES (${userId}, ${conn.owner_user_id}, ${conn.relationship}, 'ACCEPTED')
    `;
  } else {
    await sql`UPDATE family_connections SET status = 'ACCEPTED' WHERE id = ${reverse.rows[0].id}`;
  }
}

export async function requestCheckIn(ownerUserId: number, connectionId: number) {
  await ensureSchema();
  const { rows } = await sql<{ id: number }>`
    SELECT id FROM family_connections
    WHERE id = ${connectionId} AND owner_user_id = ${ownerUserId} AND status = 'ACCEPTED'
  `;
  if (rows.length === 0) throw new UserFacingError("Family connection not found");
  await sql`
    UPDATE family_connections
    SET safety_status = 'CHECK_IN_REQUESTED', check_in_requested_at = now()
    WHERE id = ${connectionId}
  `;
}

export async function respondToCheckIn(
  responderUserId: number,
  connectionId: number,
  status: "SAFE" | "NEEDS_HELP",
  location: { lat: number; lng: number } | null
) {
  await ensureSchema();
  const { rows } = await sql<{ id: number }>`
    SELECT id FROM family_connections WHERE id = ${connectionId} AND family_member_user_id = ${responderUserId}
  `;
  if (rows.length === 0) throw new UserFacingError("Family connection not found");

  if (location && status === "NEEDS_HELP") {
    await sql`
      UPDATE family_connections
      SET safety_status = ${status}, last_check_in = now(), share_location = TRUE,
          last_location_lat = ${location.lat}, last_location_lng = ${location.lng}
      WHERE id = ${connectionId}
    `;
  } else {
    await sql`
      UPDATE family_connections SET safety_status = ${status}, last_check_in = now()
      WHERE id = ${connectionId}
    `;
  }
}

export async function removeFamilyConnection(userId: number, connectionId: number) {
  await ensureSchema();
  await sql`
    DELETE FROM family_connections
    WHERE id = ${connectionId} AND (owner_user_id = ${userId} OR family_member_user_id = ${userId})
  `;
}

function toFamilyMemberView(
  r: FamilyConnectionRow & { name: string; unique_code: string; phone_number: string }
): FamilyMemberView {
  return {
    connectionId: r.id,
    userId: r.family_member_user_id,
    name: r.name,
    uniqueCode: r.unique_code,
    phoneNumber: r.phone_number,
    relationship: r.relationship,
    safetyStatus: r.safety_status,
    lastCheckIn: r.last_check_in,
    checkInRequestedAt: r.check_in_requested_at,
    shareLocation: r.share_location,
    location:
      r.share_location && r.last_location_lat != null && r.last_location_lng != null
        ? { lat: r.last_location_lat, lng: r.last_location_lng }
        : null,
  };
}

export class UserFacingError extends Error {}
