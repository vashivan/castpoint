import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import db from "@/lib/db";
import { getEmployerFromCookies } from "@/lib/employerAuth";
import { sendArtistStatusEmail } from "@/lib/mailerStatus";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{
    id: string;
    appId: string;
  }>;
};

const statusSchema = z.object({
  status: z.enum([
    "pending",
    "under_review",
    "approved",
    "rejected",
  ]),
});

function parseIds(id: string, appId: string) {
  const jobId = Number(id);
  const applicationId = Number(appId);

  if (
    !Number.isInteger(jobId) ||
    !Number.isInteger(applicationId) ||
    jobId <= 0 ||
    applicationId <= 0
  ) {
    return null;
  }

  return {
    jobId,
    applicationId,
  };
}

/**
 * GET
 *
 * Returns one application belonging to one of the
 * currently authenticated employer's jobs.
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const employer = await getEmployerFromCookies();

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

    const { id, appId } = await params;

    const parsed = parseIds(id, appId);

    if (!parsed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid id",
        },
        {
          status: 400,
        }
      );
    }

    const { jobId, applicationId } = parsed;

    const [rows]: any = await db.query(
      `
      SELECT
        a.id,
        a.application_code,
        a.job_id,

        a.artist_name,
        a.artist_country,
        a.artist_date_of_birth,

        a.artist_height,
        a.artist_weight,
        a.artist_bust,
        a.artist_waist,
        a.artist_hips,

        a.artist_experience,
        a.artist_biography,
        a.artist_picture,

        a.promo_url,
        a.cover_message,
        a.application_title,

        a.status,
        a.created_at,
        a.updated_at,

        j.title AS job_title,
        j.location AS job_location,
        j.company_name

      FROM applications a

      INNER JOIN jobs j
        ON j.id = a.job_id

      WHERE
        a.id = ?
        AND a.job_id = ?
        AND j.employer_id = ?

      LIMIT 1
      `,
      [
        applicationId,
        jobId,
        employer.id,
      ]
    );

    const application = rows?.[0];

    if (!application) {
      return NextResponse.json(
        {
          ok: false,
          error: "Application not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      application,
    });
  } catch (error) {
    console.error(
      "[employer.application.get.error]",
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
 * PATCH
 *
 * Changes the application status.
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const employer = await getEmployerFromCookies();

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

    const { id, appId } = await params;

    const parsed = parseIds(id, appId);

    if (!parsed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid id",
        },
        {
          status: 400,
        }
      );
    }

    const { jobId, applicationId } = parsed;

    const body = await req.json();

    const { status } =
      statusSchema.parse(body);

    /**
     * Check that:
     *
     * 1. application exists
     * 2. application belongs to this job
     * 3. job belongs to current employer
     */
    const [rows]: any = await db.query(
      `
      SELECT
        a.id,
        a.artist_email,
        a.application_title,
        a.application_code,
        a.status,
        j.title AS job_title

      FROM applications a

      INNER JOIN jobs j
        ON j.id = a.job_id

      WHERE
        a.id = ?
        AND a.job_id = ?
        AND j.employer_id = ?

      LIMIT 1
      `,
      [
        applicationId,
        jobId,
        employer.id,
      ]
    );

    const application = rows?.[0];

    if (!application) {
      return NextResponse.json(
        {
          ok: false,
          error: "Application not found",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * Nothing changed.
     */
    if (application.status === status) {
      return NextResponse.json({
        ok: true,
        status,
      });
    }

    /**
     * Update application status.
     */
    await db.query(
      `
      UPDATE applications

      SET
        status = ?,
        updated_at = NOW()

      WHERE id = ?
      `,
      [
        status,
        applicationId,
      ]
    );

    /**
     * Artist receives email only when
     * application is approved or rejected.
     */
    if (
      (
        status === "approved" ||
        status === "rejected"
      ) &&
      application.artist_email
    ) {
      try {
        await sendArtistStatusEmail({
          to: application.artist_email,

          jobTitle:
            application.job_title ||
            application.application_title ||
            "Castpoint application",

          status,

          appCode:
            application.application_code,
        });
      } catch (error) {
        console.error(
          "[employer.application.status.email.error]",
          error
        );
      }
    }

    return NextResponse.json({
      ok: true,
      status,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation error",
          issues: error.issues,
        },
        {
          status: 400,
        }
      );
    }

    console.error(
      "[employer.application.status.error]",
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