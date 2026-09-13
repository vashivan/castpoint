import { NextResponse } from "next/server";

import db from "@/lib/db";
import { getEmployerFromCookies } from "@/lib/employerAuth";
import { buildArtistProfilePdf } from "@/lib/pdf/ArtistProfilePdf";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{
    id: string;
    appId: string;
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, appId } = await params;

    const jobId = Number(id);
    const applicationId = Number(appId);

    if (
      !Number.isInteger(jobId) ||
      !Number.isInteger(applicationId)
    ) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT
        a.id,
        a.application_code,
        a.application_title,

        a.artist_name,
        a.artist_email,
        a.artist_phone,
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
        a.promo_url,

        j.title AS job_title,
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
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const pdf = await buildArtistProfilePdf({
      jobTitle:
        application.job_title ||
        application.application_title ||
        "Job application",

      companyName:
        application.company_name,

      artist: {
        full_name:
          application.artist_name ||
          "Artist",

        country:
          application.artist_country,

        date_of_birth:
          application.artist_date_of_birth,

        phone:
          application.artist_phone,

        email:
          application.artist_email,

        height:
          application.artist_height,

        weight:
          application.artist_weight,

        bust:
          application.artist_bust,

        waist:
          application.artist_waist,

        hips:
          application.artist_hips,

        experience:
          application.artist_experience,

        biography:
          application.artist_biography,

        picture:
          application.artist_picture,
      },

      cover_message:
        application.cover_message || "",

      promo_url:
        application.promo_url || "",
    });

    const safeName = String(
      application.artist_name || "artist"
    )
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 50);

    const filename = `${
      application.application_code || "application"
    }-${safeName}.pdf`;

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename="${filename}"`,

        "Cache-Control":
          "no-store",
      },
    });
  } catch (error) {
    console.error(
      "[employer.application.pdf.error]",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
      },
      {
        status: 500,
      }
    );
  }
}