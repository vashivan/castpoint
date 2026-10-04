// src/app/api/jobs/[id]/route.ts
// Public view of one active job, with the employer's public details.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT j.*, e.status AS employer_status, e.logo_url AS employer_logo_url,
              e.country AS employer_country, e.website AS employer_website
         FROM jobs j
         LEFT JOIN employers e ON e.id = j.employer_id
        WHERE j.id = ? AND j.is_active = 1
        LIMIT 1`,
      [jobId]
    );
    const row = rows[0];
    if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    const job = {
      id: row.id,
      title: row.title,
      location: row.location,
      contract_type: row.contract_type,
      discipline: row.discipline ?? null,
      contract_months: row.contract_months ?? null,
      contract_extendable: row.contract_extendable ?? 0,
      salary_from: row.salary_from,
      salary_to: row.salary_to,
      currency: row.currency,
      description: row.description,
      company_name: row.company_name,
      created_at: row.created_at ?? null,
      employer: row.employer_id
        ? {
            verified: row.employer_status === "verified",
            logo_url: row.employer_logo_url ?? null,
            country: row.employer_country ?? null,
            website: row.employer_website ?? null,
          }
        : null,
    };

    return NextResponse.json({ ok: true, job });
  } catch (e) {
    console.error("[api.jobs.id]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
