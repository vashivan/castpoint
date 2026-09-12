// src/lib/employerAuth.ts
//
// Employer authentication is intentionally kept SEPARATE from the
// artist auth system (different cookie name, same JWT_SECRET env
// var, own payload shape). This means a person can be logged in as
// an artist and as an employer in the same browser at the same
// time without the two sessions clobbering each other, and it
// means we never have to touch the existing `profiles` table or
// the existing `auth` cookie logic used everywhere else in the app.

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export const EMPLOYER_COOKIE = "employer_auth";

export interface EmployerJwtPayload {
  id: number;
  email: string;
  company_name: string;
  status: "pending" | "verified" | "blocked";
}

export interface EmployerRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string | null;
  company_name: string;
  contact_name: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  description: string | null;
  logo_url: string | null;
  logo_public_id: string | null;
  status: "pending" | "verified" | "blocked";
  created_at: string;
  updated_at: string | null;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return secret;
}

export function signEmployerToken(payload: EmployerJwtPayload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

/** For use in Route Handlers reading the cookie via next/headers (Server Components/Route Handlers). */
export async function getEmployerFromCookies(): Promise<EmployerJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(EMPLOYER_COOKIE)?.value;
    if (!token) return null;
    return jwt.verify(token, getSecret()) as EmployerJwtPayload;
  } catch {
    return null;
  }
}

/** For use where you already have a NextRequest (middleware-style helpers). */
export function getEmployerFromRequest(req: NextRequest): EmployerJwtPayload | null {
  try {
    const token = req.cookies.get(EMPLOYER_COOKIE)?.value;
    if (!token) return null;
    return jwt.verify(token, getSecret()) as EmployerJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Verifies the employer session AND re-checks the DB row (in case
 * the account was blocked after the token was issued). Returns the
 * full employer row (minus password_hash) or null.
 */
export async function requireEmployer(): Promise<Omit<EmployerRow, "password_hash"> | null> {
  const payload = await getEmployerFromCookies();
  if (!payload) return null;

  const [rows] = await db.query<EmployerRow[]>(
    `SELECT id, email, password_hash, company_name, contact_name, country, phone,
            website, instagram, description, logo_url, logo_public_id, status,
            created_at, updated_at
       FROM employers
      WHERE id = ?
      LIMIT 1`,
    [payload.id]
  );

  const employer = rows[0];
  if (!employer) return null;
  if (employer.status === "blocked") return null;

  const { password_hash, ...safe } = employer;
  return safe;
}
