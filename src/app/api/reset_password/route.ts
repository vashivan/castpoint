// app/api/password/reset/route.ts
import "mysql2";
import { db } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at
         FROM password_reset_tokens prt
        WHERE prt.token_hash = ?
        LIMIT 1`,
      [tokenHash]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const row = rows[0];
    if (row.used_at) {
      return NextResponse.json({ error: "Token already used" }, { status: 400 });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query("UPDATE profiles SET password = ? WHERE id = ?", [hashed, row.user_id]);

    // позначити токен використаним і (опційно) видалити інші токени юзера
    await db.query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?", [row.id]);
    await db.query("DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL", [row.user_id]);

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    console.error("reset password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
