import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { acknowledgeSosNotification, UserFacingError } from "@/lib/family";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const notificationId = Number(body.notificationId);
  if (!Number.isFinite(notificationId)) {
    return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
  }

  try {
    await acknowledgeSosNotification(user.id, notificationId);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof UserFacingError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}
