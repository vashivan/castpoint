// Password reset for both artists (profiles.password) and employers
// (employers.password_hash). Tokens live in password_reset_tokens; only a
// SHA-256 hash of the token is stored, and user_type says which table the
// user_id points to.

import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";

import { db } from "./db";
import { sendPasswordResetEmail } from "./email";

export type ResetUserType = "artist" | "employer";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const ACCOUNTS: Record<ResetUserType, { table: string; passwordColumn: string }> = {
  artist: { table: "profiles", passwordColumn: "password" },
  employer: { table: "employers", passwordColumn: "password_hash" },
};

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

/**
 * Creates a reset token and e-mails the link if the account exists.
 * Callers always answer the same way, so this never reveals whether an e-mail is registered.
 */
export async function requestPasswordReset(email: string, userType: ResetUserType, baseUrl: string) {
  const { table } = ACCOUNTS[userType];
  const [users] = await db.query<RowDataPacket[]>(`SELECT id FROM ${table} WHERE email = ? LIMIT 1`, [email]);
  const userId = users[0]?.id;
  if (!userId) return;

  await db.query("DELETE FROM password_reset_tokens WHERE user_id = ? AND user_type = ? AND used_at IS NULL", [
    userId,
    userType,
  ]);

  const token = crypto.randomBytes(32).toString("hex");
  await db.query("INSERT INTO password_reset_tokens (user_id, user_type, token_hash, expires_at) VALUES (?, ?, ?, ?)", [
    userId,
    userType,
    hashToken(token),
    new Date(Date.now() + TOKEN_TTL_MS),
  ]);

  await sendPasswordResetEmail(email, `${baseUrl}/reset-password?token=${token}`);
}

export class ResetError extends Error {}

/** Sets the new password for the token's owner and returns which kind of account it was. */
export async function resetPassword(token: string, password: string): Promise<ResetUserType> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, user_id, user_type, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ? LIMIT 1",
    [hashToken(token)]
  );
  const row = rows[0];
  if (!row) throw new ResetError("Invalid or expired token");
  if (row.used_at) throw new ResetError("Token already used");
  if (new Date(row.expires_at).getTime() < Date.now()) throw new ResetError("Token expired");

  const userType: ResetUserType = row.user_type === "employer" ? "employer" : "artist";
  const { table, passwordColumn } = ACCOUNTS[userType];

  await db.query(`UPDATE ${table} SET ${passwordColumn} = ? WHERE id = ?`, [await bcrypt.hash(password, 10), row.user_id]);
  await db.query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?", [row.id]);
  await db.query("DELETE FROM password_reset_tokens WHERE user_id = ? AND user_type = ? AND used_at IS NULL", [
    row.user_id,
    userType,
  ]);

  return userType;
}
