// app/api/password/forgot/route.ts
import "mysql2";
import { db } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { RowDataPacket } from "mysql2";
import { sendPasswordResetEmail } from "../../../lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Завжди повертаємо 200, щоб не палити існування email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: "If the email exists, a reset link will be sent." });
    }

    const [users] = await db.query<RowDataPacket[]>(
      "SELECT id FROM profiles WHERE email = ? LIMIT 1",
      [email]
    );

    // Навіть якщо немає юзера — повертаємо таке саме повідомлення
    if (!users.length) {
      return NextResponse.json({ message: "If the email exists, a reset link will be sent." });
    }

    const userId = users[0].id;

    // (опційно) приберемо старі невикористані токени
    await db.query("DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL", [userId]);

    // генеруємо токен і зберігаємо лише ХЕШ
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );

    const base = 'http://castpoint.art';
    const resetUrl = `${base}/reset-password?token=${token}`;

    // Надсилаємо листа (не чекаємо довго, але в демо нехай await)
    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ message: "If the email exists, a reset link will be sent." });
  } catch (error) {
    console.error("forgot password error:", error);
    // все одно не розкриваємо інформацію
    return NextResponse.json({ message: "If the email exists, a reset link will be sent." });
  }
}
