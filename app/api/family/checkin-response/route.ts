import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { respondToCheckIn, UserFacingError } from "@/lib/family";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const connectionId = Number(body.connectionId);
  const status = body.status === "NEEDS_HELP" ? "NEEDS_HELP" : body.status === "SAFE" ? "SAFE" : null;
  const location =
    body.location && typeof body.location.lat === "number" && typeof body.location.lng === "number"
      ? { lat: body.location.lat, lng: body.location.lng }
      : null;

  if (!Number.isFinite(connectionId) || !status) {
    return NextResponse.json({ error: "connectionId and status are required" }, { status: 400 });
  }

  try {
    await respondToCheckIn(user.id, connectionId, status, location);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof UserFacingError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
}
