import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { resolveSos, UserFacingError } from "@/lib/family";

// Only the sender of an SOS can mark it resolved — see resolveSos, which
// scopes the UPDATE to sos_requests.user_id = the authenticated caller.
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const sosId = Number(body.sosId);
  if (!Number.isFinite(sosId)) {
    return NextResponse.json({ error: "sosId is required" }, { status: 400 });
  }

  try {
    await resolveSos(user.id, sosId);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof UserFacingError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}
