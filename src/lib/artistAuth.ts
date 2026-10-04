// src/lib/artistAuth.ts
//
// Artist session helpers. Mirrors src/lib/employerAuth.ts so every
// artist route reads and verifies the `auth` cookie the same way.

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { User } from "@/utils/Types";

export const ARTIST_COOKIE = "auth";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type ArtistJwtPayload = User & { id: number };

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return secret;
}

/** Returns the verified artist payload from the `auth` cookie, or null. */
export async function getArtistFromCookies(): Promise<ArtistJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ARTIST_COOKIE)?.value;
    if (!token) return null;
    return jwt.verify(token, getSecret()) as ArtistJwtPayload;
  } catch {
    return null;
  }
}

/** Signs a fresh artist token and sets it on the response. */
export function setArtistCookie(res: NextResponse, payload: object) {
  const token = jwt.sign(payload, getSecret(), { expiresIn: "7d" });
  res.cookies.set(ARTIST_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res;
}
