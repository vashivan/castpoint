import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";

export const runtime = "nodejs";

const jobCreateSchema = z.object({
  title: z.string().min(3).max(120),
  company_name: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
  contract_type: z.enum(["short", "medium", "long"]),
  salary_from: z.coerce.number().nonnegative().optional(),
  salary_to: z.coerce.number().nonnegative().optional(),
  currency: z.string().min(1).max(8).default("$"),
  description: z.string().min(20).max(8000),
  apply_email: z.string().email().optional(),
  contract_end: z.string().optional(), // "2026-08-30"
});

function getEmployerIdFromSession(req: NextRequest) {
  // ✅ встав сюди вашу логіку (JWT/cookie/session)
  // тимчасово: читаємо з хедера (для тесту)
  const v = req.headers.get("x-employer-id");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  try {
    const employerId = getEmployerIdFromSession(req);
    if (!employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = jobCreateSchema.parse(body);

    if (data.salary_from != null && data.salary_to != null && data.salary_from > data.salary_to) {
      return NextResponse.json(
        { error: "salary_from cannot be greater than salary_to" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `
      INSERT INTO jobs
        (employer_id, title, location, contract_type, salary_from, salary_to, currency,
         description, apply_email, is_active, company_name, created_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW())
      `,
      [
        employerId,
        data.title,
        data.location,
        data.contract_type,
        data.salary_from ?? null,
        data.salary_to ?? null,
        data.currency,
        data.description,
        data.apply_email ?? null,
        data.company_name,
      ]
    );

    return NextResponse.json(
      { ok: true, job_id: result.insertId, status: "pending" },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 400 });
  }
}
