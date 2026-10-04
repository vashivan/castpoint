// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import { isDiscipline } from "@/lib/jobSchema";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const contract = searchParams.get("contract") as "short" | "medium" | "long" | null;
  const location = (searchParams.get("location") || "").trim();
  const discipline = (searchParams.get("discipline") || "").trim().toLowerCase();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10)));
  const offset = (page - 1) * pageSize;

  const where: string[] = [];
  const params: (string | number)[] = [];

  // ✅ always show only active jobs
  where.push("j.is_active = 1");

  if (q) {
    where.push("(j.title LIKE ? OR j.description LIKE ? OR j.location LIKE ? OR j.company_name LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }

  if (contract && ["short", "medium", "long"].includes(contract)) {
    where.push("j.contract_type = ?");
    params.push(contract);
  }

  if (isDiscipline(discipline)) {
    where.push("j.discipline = ?");
    params.push(discipline);
  }

  if (location) {
    where.push("j.location LIKE ?");
    params.push(`%${location}%`);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  try {
    const [cntRows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM jobs j
       ${whereSql}`,
      params
    );
    const total = cntRows[0]?.total || 0;

    const [rows] = await db.query<RowDataPacket[]>(
      // j.* so the list keeps working before the discipline/months columns exist;
      // only public fields are sent back below.
      `SELECT j.*
       FROM jobs j
       ${whereSql}
       ORDER BY j.id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const jobs = rows.map((r) => ({
      id: r.id,
      title: r.title,
      location: r.location,
      contract_type: r.contract_type,
      discipline: r.discipline ?? null,
      contract_months: r.contract_months ?? null,
      contract_extendable: r.contract_extendable ?? 0,
      salary_from: r.salary_from,
      salary_to: r.salary_to,
      currency: r.currency,
      description: r.description,
      company_name: r.company_name,
      is_active: r.is_active,
    }));

    return NextResponse.json({ ok: true, total, page, pageSize, jobs });
  } catch (e) {
    console.error("[api.jobs]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
