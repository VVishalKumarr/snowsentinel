import { NextRequest, NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const headerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const token = headerToken || cookieToken;
  if (token) await deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
