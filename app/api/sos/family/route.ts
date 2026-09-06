import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { sendSosToFamily } from "@/lib/family";

// Delivers an SOS through the app's own database rather than an external
// channel — the recipient sees it next time they open SnowSentinel (there
// is no push-notification infrastructure here, which is disclosed in the
// UI rather than implied away as instant delivery).
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const recipientUserIds: number[] = Array.isArray(body.recipientUserIds)
    ? body.recipientUserIds.map((n: unknown) => Number(n)).filter((n: number) => Number.isFinite(n))
    : [];
  const message = String(body.message ?? "").slice(0, 2000);
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lng = typeof body.lng === "number" ? body.lng : null;

  if (recipientUserIds.length === 0 || !message) {
    return NextResponse.json({ error: "recipientUserIds and message are required" }, { status: 400 });
  }

  const { sosId, notifiedCount } = await sendSosToFamily(
    user.id,
    recipientUserIds,
    message,
    lat != null && lng != null ? { lat, lng } : null
  );
  return NextResponse.json({ success: true, sosId, notifiedCount });
}
