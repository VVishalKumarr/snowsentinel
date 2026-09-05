import { NextRequest, NextResponse } from "next/server";
import { verifyAndConsumeOtp, createSession, normalizePhone } from "@/lib/auth";
import { findUserByPhone, generateUniqueCode, sql, ensureSchema, type DbUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { phone?: string; otp?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  const otp = (body.otp ?? "").trim();

  if (phone.length < 7 || otp.length !== 6) {
    return NextResponse.json({ error: "Phone and 6-digit code are required" }, { status: 400 });
  }

  const valid = await verifyAndConsumeOtp(phone, otp);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect or expired code" }, { status: 401 });
  }

  let user = await findUserByPhone(phone);

  if (!user) {
    const name = (body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required to create an account" }, { status: 400 });
    }
    await ensureSchema();
    const uniqueCode = await generateUniqueCode();
    const { rows } = await sql<DbUser>`
      INSERT INTO users (name, phone_number, unique_code)
      VALUES (${name}, ${phone}, ${uniqueCode})
      RETURNING *
    `;
    user = rows[0];
  }

  const token = await createSession(user.id);

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      phoneNumber: user.phone_number,
      uniqueCode: user.unique_code,
    },
  });
}
