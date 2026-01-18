import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  email: z.string().email(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const { email: artistEmail } = querySchema.parse({ email });

    const [rows] = await db.query(
      `SELECT id, job_id, application_code, sent_email_status, created_at, application_title
       FROM applications
       WHERE artist_email = ?
       ORDER BY created_at DESC`,
      [artistEmail]
    );

    return NextResponse.json({ ok: true, applications: rows });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Bad request" },
      { status: 400 }
    );
  }
}
