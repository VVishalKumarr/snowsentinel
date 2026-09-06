import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { unregisterDeviceToken } from "@/lib/deviceTokens";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  await unregisterDeviceToken(user.id, token);
  return NextResponse.json({ success: true });
}
