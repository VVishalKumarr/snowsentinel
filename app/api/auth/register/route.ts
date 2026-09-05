import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createSession, normalizeUsername, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth";
import { createUser, findUserByUsername } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { name?: string; username?: string; password?: string; confirmPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const username = normalizeUsername(body.username ?? "");
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!name) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  if (username.length < 3) {
    return NextResponse.json(
      { error: "Username must be at least 3 characters (letters, numbers, underscore, dot)" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const existing = await findUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: "This username is already in use. Please choose another." }, { status: 409 });
  }

  const user = await createUser({ name, username, passwordHash: hashPassword(password) });
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
