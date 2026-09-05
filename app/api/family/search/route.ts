import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, normalizeUsername } from "@/lib/auth";
import { searchUserByUsername } from "@/lib/family";

// Returns only name + username — never phone number, password hash, or
// anything else — so a search can't be used to enumerate private info.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const username = normalizeUsername(req.nextUrl.searchParams.get("username") ?? "");
  if (!username) {
    return NextResponse.json({ error: "Enter a username" }, { status: 400 });
  }

  const found = await searchUserByUsername(username);
  if (!found) {
    return NextResponse.json({ found: false });
  }
  return NextResponse.json({ found: true, name: found.name, username: found.username });
}
