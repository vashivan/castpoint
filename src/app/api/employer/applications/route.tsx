import { NextResponse } from "next/server";

import db from "@/lib/db";
import { getEmployerFromCookies } from "@/lib/employerAuth";

export const runtime = "nodejs";

export async function GET() {
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

    const [rows]: any = await db.query(
      `
      SELECT
        a.id,
        a.application_code,
        a.job_id,
        a.application_title,

        a.artist_name,
        a.artist_country,
        a.artist_picture,

        a.status,
        a.created_at,

        j.title AS job_title,
        j.location AS job_location

      FROM applications a

      INNER JOIN jobs j
        ON j.id = a.job_id

      WHERE j.employer_id = ?

      ORDER BY a.created_at DESC
      `,
      [employer.id]
    );

    return NextResponse.json({
      ok: true,
      applications: rows || [],
    });
  } catch (error) {
    console.error(
      "[employer.applications.get.error]",
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