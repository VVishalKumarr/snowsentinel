import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { removeFamilyConnection } from "@/lib/family";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const connectionId = Number(body.connectionId);
  if (!Number.isFinite(connectionId)) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
  }

  await removeFamilyConnection(user.id, connectionId);
  return NextResponse.json({ success: true });
}
