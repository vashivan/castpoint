// src/app/api/employer/jobs/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import db from "@/lib/db";
import { getEmployerFromCookies } from "@/lib/employerAuth";
import {
  sendTelegramMessage,
  escapeTelegramHtml,
} from "@/lib/telegram";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

async function loadOwnedJob(
  employerId: number,
  jobId: number
) {
  const [rows]: any = await db.query(
    `
    SELECT *
    FROM jobs
    WHERE id = ?
      AND employer_id = ?
    LIMIT 1
    `,
    [jobId, employerId]
  );

  return rows?.[0] ?? null;
}

const optionalEmail = z
  .union([
    z.string().email(),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (!value) return null;
    return value.trim();
  });

const updateSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(120)
    .optional(),

  location: z
    .string()
    .min(2)
    .max(120)
    .optional(),

  contract_type: z
    .enum([
      "short",
      "medium",
      "long",
    ])
    .optional(),

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
    .optional(),

  description: z
    .string()
    .min(20)
    .max(8000)
    .optional(),

  apply_email: optionalEmail,

  action: z
    .enum([
      "save",
      "resubmit",
      "close",
    ])
    .optional()
    .default("save"),
});

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
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

    const { id } = await params;

    const jobId = Number(id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid job id",
        },
        {
          status: 400,
        }
      );
    }

    const job = await loadOwnedJob(
      employer.id,
      jobId
    );

    if (!job) {
      return NextResponse.json(
        {
          ok: false,
          error: "Job not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      job,
    });
  } catch (error) {
    console.error(
      "[employer.jobs.get.error]",
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

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
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

    const { id } = await params;

    const jobId = Number(id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid job id",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await loadOwnedJob(
        employer.id,
        jobId
      );

    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "Job not found",
        },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();

    const data =
      updateSchema.parse(body);

    const { action, ...fields } =
      data;

    const nextSalaryFrom =
      fields.salary_from !== undefined
        ? fields.salary_from
        : existing.salary_from;

    const nextSalaryTo =
      fields.salary_to !== undefined
        ? fields.salary_to
        : existing.salary_to;

    if (
      nextSalaryFrom != null &&
      nextSalaryTo != null &&
      Number(nextSalaryFrom) >
        Number(nextSalaryTo)
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

    const updates: string[] = [];

    const values: (
      | string
      | number
      | null
    )[] = [];

    for (const [key, value] of Object.entries(
      fields
    )) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);

        values.push(
          value as
            | string
            | number
            | null
        );
      }
    }

    if (action === "close") {
      updates.push(
        "is_active = 0",
        "status = 'closed'"
      );
    } else if (
      action === "resubmit"
    ) {
      updates.push(
        "is_active = 0",
        "status = 'pending'"
      );
    } else if (
      action === "save"
    ) {
      /*
       * Якщо employer редагує вже
       * опубліковану вакансію,
       * повертаємо її на moderation.
       */
      if (
        existing.status ===
          "approved" ||
        existing.is_active === 1
      ) {
        updates.push(
          "is_active = 0",
          "status = 'pending'"
        );
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Nothing to update",
        },
        {
          status: 400,
        }
      );
    }

    updates.push(
      "updated_at = NOW()"
    );

    values.push(
      jobId,
      employer.id
    );

    await db.query(
      `
      UPDATE jobs
      SET ${updates.join(", ")}
      WHERE id = ?
        AND employer_id = ?
      `,
      values
    );

    const updated =
      await loadOwnedJob(
        employer.id,
        jobId
      );

    /*
     * Якщо employer натиснув
     * Save & submit for review,
     * після успішного UPDATE
     * надсилаємо нове повідомлення
     * на moderation у Telegram.
     */
    if (
      action === "resubmit" &&
      updated
    ) {
      await sendTelegramMessage(
        [
          `✏️ <b>Vacancy updated — review required</b>`,
          ``,

          `<b>${escapeTelegramHtml(
            updated.title
          )}</b>`,

          ``,

          `<b>Company:</b> ${escapeTelegramHtml(
            employer.company_name
          )}`,

          `<b>Location:</b> ${escapeTelegramHtml(
            updated.location
          )}`,

          `<b>Contract:</b> ${escapeTelegramHtml(
            updated.contract_type
          )}`,

          `<b>Salary:</b> ${
            updated.salary_from ?? "—"
          } – ${
            updated.salary_to ?? "—"
          } ${escapeTelegramHtml(
            updated.currency
          )}`,

          ``,

          `Status: ⏳ pending moderation`,
        ].join("\n"),
        [
          [
            {
              text: "✅ Publish",
              callback_data:
                `job:approve:${jobId}`,
            },
            {
              text: "❌ Reject",
              callback_data:
                `job:reject:${jobId}`,
            },
          ],
        ]
      );
    }

    return NextResponse.json({
      ok: true,
      job: updated,
    });
  } catch (error) {
    if (
      error instanceof ZodError
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Validation error",
          issues: error.issues,
        },
        {
          status: 400,
        }
      );
    }

    console.error(
      "[employer.jobs.update.error]",
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
};