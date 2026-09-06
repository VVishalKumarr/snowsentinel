import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSosStatusForSender, UserFacingError } from "@/lib/family";

// Only the sender of an SOS can see who has acknowledged it — see
// getSosStatusForSender, which scopes the lookup to sos_requests owned by
// the authenticated caller. Anyone else querying a real sosId gets 404,
// not the data, so this can't be used to probe another user's SOS events.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sosId = Number(req.nextUrl.searchParams.get("sosId"));
  if (!Number.isFinite(sosId)) {
    return NextResponse.json({ error: "sosId is required" }, { status: 400 });
  }

  try {
    const status = await getSosStatusForSender(user.id, sosId);
    return NextResponse.json(status);
  } catch (e) {
    if (e instanceof UserFacingError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}
