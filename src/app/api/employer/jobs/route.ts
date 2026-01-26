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

async function sendToTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");
  if (!chatId) throw new Error("Missing TELEGRAM_CHAT_ID");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed (${res.status}): ${JSON.stringify(data)}`);
  }
}


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

    const captions = [
      `New vacancy <strong>${data.title}</strong>`,
      `Email: ${data.apply_email || "—"}`,
      `Company: ${data.company_name}`,
      `Location: ${data.location}`
    ]
      .filter(Boolean)
      .join("\n");

  await sendToTelegram(captions);

    return NextResponse.json(
      { ok: true, job_id: result.insertId, status: "pending" },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 400 });
  }
}
