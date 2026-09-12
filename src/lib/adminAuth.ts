// src/lib/adminAuth.ts
//
// There is no separate admin account system in this project.
// `profiles.role` already exists as a column but nothing sets it.
// Rather than invent a second parallel login, admin access reuses
// the EXISTING artist `auth` cookie/JWT and just requires
// role === 'admin' on that same profiles row. To make an existing
// account an admin, run (once, in phpMyAdmin):
//
//   UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
//
// then log in normally at /login.

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export interface AdminSessionPayload {
  id: number;
  email: string;
  role: string;
  name?: string;
}

export async function requireAdmin(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AdminSessionPayload;
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}
