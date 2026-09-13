// src/app/api/employer/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import type { ResultSetHeader } from "mysql2";

import db from "@/lib/db";
import {
  getEmployerFromCookies,
  requireEmployer,
} from "@/lib/employerAuth";

export const runtime = "nodejs";

/*
 * GET employer profile
 */
export async function GET() {
  try {
    const employer = await requireEmployer();

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

    return NextResponse.json({
      ok: true,
      employer,
    });
  } catch (error) {
    console.error(
      "[employer.profile.get.error]",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * Optional string:
 * "" -> null
 */
const optionalString = (max: number) =>
  z
    .union([
      z.string().max(max),
      z.null(),
      z.undefined(),
    ])
    .transform((value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return value;
      }

      const trimmed = value.trim();

      return trimmed || null;
    });

/*
 * Optional URL:
 *
 * "" -> null
 * www.example.com -> https://www.example.com
 */
const optionalUrl = z.preprocess(
  (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return value;
    }

    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (
      trimmed.startsWith("www.")
    ) {
      return `https://${trimmed}`;
    }

    return trimmed;
  },

  z
    .union([
      z.string().url(),
      z.null(),
    ])
    .optional()
);

const schema = z.object({
  contact_name: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .optional(),

  company_name: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .optional(),

  country: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .optional(),

  phone: optionalString(50),

  website: optionalUrl,

  instagram: optionalString(255),

  description: optionalString(4000),

  logo_url: optionalUrl,

  logo_public_id: optionalString(500),
});

/*
 * UPDATE employer profile
 */
export async function PUT(
  req: NextRequest
) {
  try {
    const session =
      await getEmployerFromCookies();

    if (!session) {
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

    console.log(
      "[employer.profile.body]",
      body
    );

    const data = schema.parse(body);

    const updates: string[] = [];

    const values: (
      | string
      | number
      | null
    )[] = [];

    for (const [
      key,
      value,
    ] of Object.entries(data)) {
      /*
       * undefined = поле взагалі
       * не передали → не змінюємо.
       *
       * null = користувач очистив поле
       * → записуємо NULL.
       */
      if (value !== undefined) {
        updates.push(`${key} = ?`);

        values.push(
          value as string | null
        );
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nothing to update",
        },
        {
          status: 400,
        }
      );
    }

    updates.push(
      "updated_at = NOW()"
    );

    values.push(session.id);

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE employers
        SET ${updates.join(", ")}
        WHERE id = ?
        `,
        values
      );

    console.log(
      "[employer.profile.update]",
      {
        employerId: session.id,
        affectedRows:
          result.affectedRows,
        changedRows:
          result.changedRows,
      }
    );

    if (
      result.affectedRows === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Employer not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * requireEmployer() заново
     * читає employer з DB,
     * тому отримуємо вже свіжі дані.
     */
    const employer =
      await requireEmployer();

    if (!employer) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Failed to load updated employer",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      employer,
    });
  } catch (error) {
    if (
      error instanceof ZodError
    ) {
      console.error(
        "[employer.profile.validation]",
        error.issues
      );

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
      "[employer.profile.update.error]",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}