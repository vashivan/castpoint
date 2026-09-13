// src/app/api/employer/jobs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import {
  sendTelegramMessage,
  escapeTelegramHtml,
} from "@/lib/telegram";

import db from "@/lib/db";
import { getEmployerFromCookies } from "@/lib/employerAuth";

export const runtime = "nodejs";

const jobCreateSchema = z.object({
  title: z.string().min(3).max(120),

  location: z.string().min(2).max(120),

  contract_type: z.enum([
    "short",
    "medium",
    "long",
  ]),

  salary_from: z.coerce
    .number()
    .nonnegative()
    .optional(),

  salary_to: z.coerce
    .number()
    .nonnegative()
    .optional(),

  currency: z
    .string()
    .min(1)
    .max(8)
    .default("$"),

  description: z
    .string()
    .min(20)
    .max(8000),

  apply_email: z
    .string()
    .email()
    .optional(),
});

// async function sendToTelegram(
//   text: string
// ) {
//   const token =
//     process.env.TELEGRAM_BOT_TOKEN;

//   const chatId =
//     process.env.TELEGRAM_CHAT_ID;

//   if (!token || !chatId) {
//     return;
//   }

//   try {
//     await fetch(
//       `https://api.telegram.org/bot${token}/sendMessage`,
//       {
//         method: "POST",

//         headers: {
//           "content-type":
//             "application/json",
//         },

//         body: JSON.stringify({
//           chat_id: chatId,
//           text,

//           parse_mode: "HTML",

//           disable_web_page_preview: true,
//         }),
//       }
//     );
//   } catch (err) {
//     console.error(
//       "[employer.jobs.telegram.error]",
//       err
//     );
//   }
// }

/**
 * Employers list their own jobs
 */
export async function GET() {
  try {
    const employer =
      await getEmployerFromCookies();

    if (!employer) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        title,
        location,
        contract_type,
        salary_from,
        salary_to,
        currency,
        description,
        apply_email,
        is_active,
        status,
        company_name,
        created_at,
        updated_at
      FROM jobs
      WHERE employer_id = ?
      ORDER BY id DESC
      `,
      [employer.id]
    );

    return NextResponse.json({
      ok: true,
      jobs: rows,
    });
  } catch (error) {
    console.error(
      "[employer.jobs.list.error]",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Employer creates new vacancy
 */
export async function POST(
  req: NextRequest
) {
  try {
    const employer =
      await getEmployerFromCookies();

    if (!employer) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const data =
      jobCreateSchema.parse(body);

    if (
      data.salary_from != null &&
      data.salary_to != null &&
      data.salary_from >
      data.salary_to
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "salary_from cannot be greater than salary_to",
        },
        {
          status: 400,
        }
      );
    }

    const [result]: any =
      await db.execute(
        `
    INSERT INTO jobs (
      employer_id,
      title,
      location,
      contract_type,
      salary_from,
      salary_to,
      currency,
      description,
      apply_email,
      is_active,
      status,
      company_name,
      created_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      0,
      'pending',
      ?,
      NOW()
    )
    `,
        [
          employer.id,
          data.title.trim(),
          data.location.trim(),
          data.contract_type,
          data.salary_from ?? null,
          data.salary_to ?? null,
          data.currency.trim(),
          data.description.trim(),
          data.apply_email ?? null,
          employer.company_name,
        ]
      );

    const jobId = result.insertId;

    await sendTelegramMessage(
      [
        `🆕 <b>New vacancy</b>`,
        ``,
        `<b>${escapeTelegramHtml(data.title)}</b>`,
        ``,
        `<b>Company:</b> ${escapeTelegramHtml(employer.company_name)}`,
        `<b>Location:</b> ${escapeTelegramHtml(data.location)}`,
        `<b>Contract:</b> ${escapeTelegramHtml(data.contract_type)}`,
        `<b>Salary:</b> ${data.salary_from ?? "—"
        } – ${data.salary_to ?? "—"
        } ${escapeTelegramHtml(data.currency)}`,
        ``,
        `Status: ⏳ pending moderation`,
      ].join("\n"),
      [
        [
          {
            text: "✅ Publish",
            callback_data: `job:approve:${jobId}`,
          },
          {
            text: "❌ Reject",
            callback_data: `job:reject:${jobId}`,
          },
        ],
      ]
    );

    return NextResponse.json(
      {
        ok: true,

        job_id: result.insertId,

        status: "pending",
      },
      {
        status: 201,
      }
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Validation error",
          issues: e.issues,
        },
        {
          status: 400,
        }
      );
    }

    console.error(
      "[employer.jobs.create.error]",
      e
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}