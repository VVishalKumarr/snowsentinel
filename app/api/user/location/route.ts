import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { updateUserLocation } from "@/lib/db";
import { REGIONS } from "@/lib/demoData";

// Only ever called from the existing, explicit "enable location" opt-in
// (see LocationRiskCard / HazardAlertContext.requestLocation) — never
// collected silently. Used solely for a coarse, region-level match when
// deciding who an automated hazard alert should reach; never shown to
// other users.
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const regionId = String(body.regionId ?? "");
  const lat = Number(body.lat);
  const lng = Number(body.lng);

  if (!REGIONS.some((r) => r.id === regionId) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "regionId, lat, and lng are required" }, { status: 400 });
  }

  await updateUserLocation(user.id, { regionId, lat, lng });
  return NextResponse.json({ success: true });
}
