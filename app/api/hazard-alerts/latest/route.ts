import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getLatestActiveHazardAlert } from "@/lib/hazardAlerts";

// Polled by HazardAlertContext so a website tab that's already open picks
// up a hazard alert triggered elsewhere (e.g. from the Demo Hazard Control
// Panel on another device) without a page reload — the same real,
// database-backed event that drove the push notifications, not a
// separately-invented client-side state.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const regionId = req.nextUrl.searchParams.get("regionId");
  const alert = await getLatestActiveHazardAlert(regionId);
  return NextResponse.json({ alert });
}
