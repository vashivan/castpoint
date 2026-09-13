// src/app/api/employer/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import {
  sendTelegramMessage,
  escapeTelegramHtml,
} from "@/lib/telegram";

import type { RowDataPacket, ResultSetHeader } from "mysql2";

import {
  signEmployerToken,
  EMPLOYER_COOKIE,
} from "@/lib/employerAuth";

export const runtime = "nodejs";

const optionalString = (max: number) =>
  z
    .union([z.string().max(max), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== "string") return null;

      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed : null;
    });

const schema = z
  .object({
    contact_name: z.string().trim().min(2).max(255),

    email: z.string().trim().email().max(255),

    password: z.string().min(8).max(255),

    confirm_password: z.string().min(8).max(255),

    company_name: z.string().trim().min(2).max(255),

    country: z.string().trim().min(2).max(120),

    phone: optionalString(50),

    website: optionalString(500),

    instagram: optionalString(255),

    description: optionalString(2000),
  })
  .refine(
    (data) => data.password === data.confirm_password,
    {
      message: "Passwords do not match",
      path: ["confirm_password"],
    }
  );

//   async function sendToTelegram(text: string) {
//   const token = process.env.TELEGRAM_BOT_TOKEN;
//   const chatId = process.env.TELEGRAM_CHAT_ID;
//   if (!token || !chatId) return; // best-effort only, never block job creation
//   try {
//     await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
//       method: "POST",
//       headers: { "content-type": "application/json" },
//       body: JSON.stringify({
//         chat_id: chatId,
//         text,
//         parse_mode: "HTML",
//         disable_web_page_preview: true,
//       }),
//     });
//   } catch (err) {
//     console.error("[employer.jobs.telegram.error]", err);
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const data = schema.parse(body);

    const email = data.email.toLowerCase();

    // 1. Перевіряємо, чи вже існує employer з таким email
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT id FROM employers WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "An employer account with this email already exists",
        },
        { status: 400 }
      );
    }

    // 2. Хешуємо пароль
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 3. Створюємо employer
    const [result] = await db.query<ResultSetHeader>(
      `
        INSERT INTO employers (
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
        )
        VALUES (
          ?,
          ?,

          ?,
          ?,
          ?,
          ?,

          ?,
          ?,
          ?,

          NULL,
          NULL,

          'pending',
          NOW(),
          NOW()
        )
      `,
      [
        email,
        passwordHash,

        data.company_name,
        data.contact_name,
        data.country,
        data.phone,

        data.website,
        data.instagram,
        data.description,
      ]
    );

    const employerId = result.insertId;

    // 4. Одразу логінимо employer після registration
    const token = signEmployerToken({
      id: employerId,
      email,
      company_name: data.company_name,
      status: "pending",
    });

    const response = NextResponse.json(
      {
        ok: true,
        message: "Employer account created",
        employer: {
          id: employerId,
          email,
          company_name: data.company_name,
          contact_name: data.contact_name,
          country: data.country,
          phone: data.phone,
          website: data.website,
          instagram: data.instagram,
          description: data.description,
          status: "pending",
        },
      },
      { status: 201 }
    );

    response.cookies.set(EMPLOYER_COOKIE, token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    await sendTelegramMessage(
  [
    `🆕 <b>New employer registration</b>`,
    ``,
    `<b>Company:</b> ${escapeTelegramHtml(data.company_name)}`,
    `<b>Contact:</b> ${escapeTelegramHtml(data.contact_name)}`,
    `<b>Country:</b> ${escapeTelegramHtml(data.country)}`,
    `<b>Email:</b> ${escapeTelegramHtml(email)}`,
    `<b>Phone:</b> ${escapeTelegramHtml(data.phone || "—")}`,
    `<b>Website:</b> ${escapeTelegramHtml(data.website || "—")}`,
    `<b>Instagram:</b> ${escapeTelegramHtml(data.instagram || "—")}`,
    ``,
    `Status: ⏳ pending`,
  ].join("\n"),
  [
    [
      {
        text: "✅ Approve employer",
        callback_data: `employer:approve:${employerId}`,
      },
      {
        text: "🚫 Block",
        callback_data: `employer:block:${employerId}`,
      },
    ],
  ]
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

    console.error("[employer.register.error]", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}