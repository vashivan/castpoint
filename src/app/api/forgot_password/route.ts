import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/passwordReset";

// Same answer whether or not the e-mail exists, so the endpoint can't be used to probe accounts.
const GENERIC = { message: "If the email exists, a reset link will be sent." };

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json();
    if (typeof email === "string" && email.trim()) {
      const baseUrl = process.env.APP_URL || req.nextUrl.origin;
      await requestPasswordReset(email.trim().toLowerCase(), type === "employer" ? "employer" : "artist", baseUrl);
    }
  } catch (error) {
    console.error("forgot password error:", error);
  }
  return NextResponse.json(GENERIC);
}
