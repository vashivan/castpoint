// src/app/api/employer/dashboard/route.ts

import { NextResponse } from "next/server";

import db from "@/lib/db";

import { getEmployerFromCookies } from "@/lib/employerAuth";

export const runtime = "nodejs";

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

    const employerId =
      employer.id;

    // -----------------------------
    // JOB STATS
    // -----------------------------

    const [jobStatsRows]: any =
      await db.query(
        `
        SELECT

          SUM(
            CASE
              WHEN status = 'approved'
                AND is_active = 1
              THEN 1
              ELSE 0
            END
          ) AS active_jobs,

          SUM(
            CASE
              WHEN status = 'pending'
              THEN 1
              ELSE 0
            END
          ) AS pending_jobs

        FROM jobs

        WHERE employer_id = ?
        `,
        [employerId]
      );

    // -----------------------------
    // APPLICATION STATS
    // -----------------------------

    const [applicationStatsRows]: any =
      await db.query(
        `
        SELECT

          COUNT(*) AS total_applications,

          SUM(
            CASE
              WHEN a.status = 'pending'
              THEN 1
              ELSE 0
            END
          ) AS new_applications

        FROM applications a

        INNER JOIN jobs j
          ON j.id = a.job_id

        WHERE j.employer_id = ?
        `,
        [employerId]
      );

    // -----------------------------
    // RECENT JOBS
    // -----------------------------

    const [recentJobs]: any =
      await db.query(
        `
        SELECT

          id,
          title,
          location,
          is_active,
          status,
          created_at

        FROM jobs

        WHERE employer_id = ?

        ORDER BY created_at DESC

        LIMIT 5
        `,
        [employerId]
      );

    // -----------------------------
    // STATS RESPONSE
    // -----------------------------

    const stats = {
      active_jobs:
        Number(
          jobStatsRows?.[0]
            ?.active_jobs
        ) || 0,

      pending_jobs:
        Number(
          jobStatsRows?.[0]
            ?.pending_jobs
        ) || 0,

      total_applications:
        Number(
          applicationStatsRows?.[0]
            ?.total_applications
        ) || 0,

      new_applications:
        Number(
          applicationStatsRows?.[0]
            ?.new_applications
        ) || 0,
    };

    return NextResponse.json({
      ok: true,
      stats,
      recent_jobs:
        recentJobs || [],
    });
  } catch (error) {
    console.error(
      "[employer.dashboard.error]",
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