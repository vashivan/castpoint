// src/app/api/employer/jobs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import {
  sendTelegramMessage,
  escapeTelegramHtml,
} from "@/lib/telegram";

import db from "@/lib/db";
import { getEmployerFromCookies } from "@/lib/employerAuth";
import { contractExtendableSchema, contractMonthsSchema, disciplineSchema } from "@/lib/jobSchema";
import { contractLabel, contractTypeFromMonths, disciplineLabel } from "@/lib/jobFormat";

import type { ResultSetHeader } from "mysql2";
export const runtime = "nodejs";

const jobCreateSchema = z.object({
  title: z.string().min(3).max(120),

  location: z.string().min(2).max(120),

  discipline: disciplineSchema,

  // Contract length in months; contract_type is derived from it
  contract_months: contractMonthsSchema,

  contract_extendable: contractExtendableSchema.default(0),

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

  // The form sends null (or "") when the employer leaves it empty
  apply_email: z
    .union([z.string().trim().email(), z.literal(""), z.null()])
    .optional()
    .transform((v) => v || null),
});

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
        discipline,
        contract_months,
        contract_extendable,
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

    const [result] =
      await db.execute<ResultSetHeader>(
        `
    INSERT INTO jobs (
      employer_id,
      title,
      location,
      contract_type,
      discipline,
      contract_months,
      contract_extendable,
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
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
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
          contractTypeFromMonths(data.contract_months),
          data.discipline,
          data.contract_months,
          data.contract_extendable,
          data.salary_from ?? null,
          data.salary_to ?? null,
          data.currency.trim(),
          data.description.trim(),
          // Empty field: applications go to the signed-in employer's account e-mail
          data.apply_email ?? employer.email,
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
        `<b>Discipline:</b> ${escapeTelegramHtml(disciplineLabel(data.discipline) ?? data.discipline)}`,
        `<b>Contract:</b> ${escapeTelegramHtml(contractLabel(data))}`,
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
          error: e.issues
            .map((i) => `${i.path.join(".") || "form"}: ${i.message}`)
            .join("; "),
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