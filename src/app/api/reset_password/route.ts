import { NextRequest, NextResponse } from "next/server";
import { ResetError, resetPassword } from "@/lib/passwordReset";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (typeof token !== "string" || !token || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const userType = await resetPassword(token, password);
    return NextResponse.json({ message: "Password updated", user_type: userType });
  } catch (error) {
    if (error instanceof ResetError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("reset password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
