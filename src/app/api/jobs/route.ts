// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const contract = searchParams.get("contract") as "short" | "medium" | "long" | null;
  const location = (searchParams.get("location") || "").trim();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10)));
  const offset = (page - 1) * pageSize;

  const where: string[] = [];
  const params: any[] = [];

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

  if (location) {
    where.push("j.location LIKE ?");
    params.push(`%${location}%`);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  try {
    const [cntRows] = await db.query<any[]>(
      `SELECT COUNT(*) AS total
       FROM jobs j
       ${whereSql}`,
      params
    );
    const total = cntRows[0]?.total || 0;

    const [rows] = await db.query<any[]>(
      `SELECT j.id, j.title, j.location, j.contract_type, j.salary_from, j.salary_to, j.currency,
              j.description, j.company_name, j.is_active
       FROM jobs j
       ${whereSql}
       ORDER BY j.id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return NextResponse.json({ ok: true, total, page, pageSize, jobs: rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
