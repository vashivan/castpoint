import { NextResponse } from "next/server";

import db from "@/lib/db";
import { getEmployerFromCookies } from "@/lib/employerAuth";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: Request,
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

    const { id } = await params;

    const jobId = Number(id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
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

    // Спочатку перевіряємо, що ця вакансія
    // належить поточному роботодавцю

    const [jobRows]: any = await db.query(
      `
      SELECT
        id,
        title,
        location,
        company_name,
        status,
        is_active

      FROM jobs

      WHERE id = ?
        AND employer_id = ?

      LIMIT 1
      `,
      [jobId, employer.id]
    );

    const job = jobRows?.[0];

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

    // Завантажуємо заявки ТІЛЬКИ для цієї вакансії

    const [applicationRows]: any = await db.query(
      `
      SELECT
        a.id,
        a.job_id,
        a.application_code,
        a.application_title,

        a.status,
        a.created_at,
        a.updated_at,

        a.artist_email,
        a.artist_name,
        a.artist_phone,
        a.artist_instagram,
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

        a.cover_message,
        a.promo_url

      FROM applications a

      WHERE a.job_id = ?

      ORDER BY a.created_at DESC
      `,
      [jobId]
    );

    return NextResponse.json({
      ok: true,
      job,
      applications: applicationRows || [],
    });
  } catch (error) {
    console.error(
      "[employer.job.applications.get.error]",
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