// src/app/api/employer/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";

import db from "@/lib/db";

import {
  signEmployerToken,
  EMPLOYER_COOKIE,
  EmployerRow,
} from "@/lib/employerAuth";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email, password } = schema.parse(body);

    const normalizedEmail = email.toLowerCase();

    const [rows] = await db.query<EmployerRow[]>(
      `
        SELECT
          id,
          email,
          password_hash,
          company_name,
          contact_name,
          country,
          phone,
          website,
          instagram,
          description,
          logo_url,
          logo_public_id,
          status,
          created_at,
          updated_at
        FROM employers
        WHERE email = ?
        LIMIT 1
      `,
      [normalizedEmail]
    );

    const employer = rows[0];

    if (!employer || !employer.password_hash) {
      return NextResponse.json(
        {
          ok: false,
          error: "Incorrect email or password",
        },
        { status: 401 }
      );
    }

    if (employer.status === "blocked") {
      return NextResponse.json(
        {
          ok: false,
          error: "This employer account has been blocked",
        },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      employer.password_hash
    );

    if (!isMatch) {
      return NextResponse.json(
        {
          ok: false,
          error: "Incorrect email or password",
        },
        { status: 401 }
      );
    }

    const token = signEmployerToken({
      id: employer.id,
      email: employer.email,
      company_name: employer.company_name,
      status: employer.status,
    });

    // не повертаємо password_hash на frontend
    const {
      password_hash,
      ...safeEmployer
    } = employer;

    const response = NextResponse.json({
      ok: true,
      message: "Login successful",
      employer: safeEmployer,
    });

    response.cookies.set(
      EMPLOYER_COOKIE,
      token,
      {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      }
    );

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation error",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    console.error(
      "[employer.login.error]",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}