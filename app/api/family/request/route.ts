import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { sendFamilyRequest, UserFacingError } from "@/lib/family";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").replace(/[^0-9]/g, "");
  const relationship = String(body.relationship ?? "").slice(0, 60);

  if (code.length !== 6) {
    return NextResponse.json({ error: "Enter a valid 6-digit SnowSentinel ID" }, { status: 400 });
  }

  try {
    const target = await sendFamilyRequest(user.id, code, relationship);
    return NextResponse.json({ success: true, sentTo: target });
  } catch (e) {
    if (e instanceof UserFacingError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
}
