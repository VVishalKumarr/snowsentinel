import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { sql, ensureSchema } from "@/lib/db";

// Persists an SOS event server-side so it survives across the requester's
// devices and can, in principle, be reviewed later. This does NOT deliver
// the alert to family members by itself — that still happens client-side
// via native SMS / share sheet (see components/SOSButton.tsx). This route
// is the record-keeping half, not the delivery half.
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lng = typeof body.lng === "number" ? body.lng : null;
  const message = String(body.message ?? "").slice(0, 2000);
  const status = body.status === "SENT" ? "SENT" : body.status === "FAILED" ? "FAILED" : "QUEUED";

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  await ensureSchema();
  const { rows } = await sql<{ id: number; created_at: string }>`
    INSERT INTO sos_requests (user_id, latitude, longitude, message, status)
    VALUES (${user.id}, ${lat}, ${lng}, ${message}, ${status})
    RETURNING id, created_at
  `;

  return NextResponse.json({ id: rows[0].id, createdAt: rows[0].created_at, status });
}
