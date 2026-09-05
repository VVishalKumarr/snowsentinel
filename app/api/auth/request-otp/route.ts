import { NextRequest, NextResponse } from "next/server";
import { generateOtp, storeOtp, normalizePhone } from "@/lib/auth";

// No real SMS provider is configured for this hackathon prototype (see
// README). This always runs in demo mode: the OTP is returned directly in
// the API response instead of being sent by SMS. Structured so a real
// provider (Twilio, MSG91, etc.) can be dropped in later — swap the body of
// the `else` branch for an actual send, and stop returning `otp` in the
// response once one exists.
const SMS_PROVIDER_CONFIGURED = false;

export async function POST(req: NextRequest) {
  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  if (phone.length < 7) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  const otp = generateOtp();
  await storeOtp(phone, otp);

  if (SMS_PROVIDER_CONFIGURED) {
    // await smsProvider.send(phone, `Your SnowSentinel code is ${otp}`);
    return NextResponse.json({ success: true, demoMode: false });
  }

  return NextResponse.json({
    success: true,
    demoMode: true,
    otp,
    message: "DEMO AUTHENTICATION — no SMS provider configured, code shown directly.",
  });
}
