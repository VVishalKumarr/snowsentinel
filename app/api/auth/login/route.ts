import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession, normalizeUsername, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth";
import { findUserByUsername } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = normalizeUsername(body.username ?? "");
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const user = await findUserByUsername(username);
  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await createSession(user.id);

  const response = NextResponse.json({
    token,
    user: { id: user.id, name: user.name, username: user.username, uniqueCode: user.unique_code },
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
