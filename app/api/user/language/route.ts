import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { updateUserLanguage } from "@/lib/db";
import { isLanguageCode } from "@/lib/i18n/shared";

// Persists the user's language choice server-side so a push notification
// sent while the app isn't running can still be rendered in the right
// language (client-side localStorage alone can't help with that).
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!isLanguageCode(body.language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  await updateUserLanguage(user.id, body.language);
  return NextResponse.json({ success: true });
}
