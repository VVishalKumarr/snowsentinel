import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { listMyFamily, listPendingIncomingRequests, listIncomingCheckInRequests } from "@/lib/family";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [members, pendingRequests, incomingCheckIns] = await Promise.all([
    listMyFamily(user.id),
    listPendingIncomingRequests(user.id),
    listIncomingCheckInRequests(user.id),
  ]);

  return NextResponse.json({ members, pendingRequests, incomingCheckIns });
}
