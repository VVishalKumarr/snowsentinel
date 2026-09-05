import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createSession, normalizeUsername, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth";
import { createUser, findUserByUsername } from "@/lib/db";
import type { AuthErrorCode } from "@/lib/authErrors";

function fail(code: AuthErrorCode, error: string, status: number) {
  return NextResponse.json({ error, code }, { status });
}

export async function POST(req: NextRequest) {
  let body: { name?: string; username?: string; password?: string; confirmPassword?: string };
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_BODY", "Invalid request body", 400);
  }

  const name = (body.name ?? "").trim();
  const username = normalizeUsername(body.username ?? "");
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!name) return fail("NAME_REQUIRED", "Full name is required", 400);
  if (username.length < 3) {
    return fail("USERNAME_TOO_SHORT", "Username must be at least 3 characters (letters, numbers, underscore, dot)", 400);
  }
  if (password.length < 6) {
    return fail("PASSWORD_TOO_SHORT", "Password must be at least 6 characters", 400);
  }
  if (password !== confirmPassword) {
    return fail("PASSWORD_MISMATCH", "Passwords do not match", 400);
  }

  const existing = await findUserByUsername(username);
  if (existing) {
    return fail("USERNAME_TAKEN", "This username is already in use. Please choose another.", 409);
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
