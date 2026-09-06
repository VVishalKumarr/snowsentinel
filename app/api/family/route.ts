import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  listMyFamily,
  listPendingIncomingRequests,
  listIncomingCheckInRequests,
  listIncomingSosAlerts,
  listMyActiveSentSos,
  listMySosHistory,
} from "@/lib/family";

// Single aggregate endpoint the client polls for everything family/SOS
// related — deliberately not split into many small endpoints, since the
// notification center just needs "what's new for me" on an interval and
// every query here is already scoped to the authenticated user.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [members, pendingRequests, incomingCheckIns, incomingSosAlerts, myActiveSentSos, sosHistory] = await Promise.all([
    listMyFamily(user.id),
    listPendingIncomingRequests(user.id),
    listIncomingCheckInRequests(user.id),
    listIncomingSosAlerts(user.id),
    listMyActiveSentSos(user.id),
    listMySosHistory(user.id),
  ]);

  return NextResponse.json({
    members,
    pendingRequests,
    incomingCheckIns,
    incomingSosAlerts,
    myActiveSentSos,
    sosHistory,
  });
}
