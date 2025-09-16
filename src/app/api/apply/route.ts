// src/app/api/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import db from '@/lib/db'; // <= default export pool; змінюй шлях під себе
import { sendEmployerEmail } from '@/lib/mailer';

const schema = z.object({
  job_id: z.coerce.number(), // приймає і "12", і 12
  artist: z.object({
    full_name: z.string().min(2),
    email: z.string().email(),
    date_of_birth: z.string().optional(),
    phone: z.string().optional(),
    instagram: z.string().optional(),
    country: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    experience: z.string().optional(),
    biography: z.string().optional(),
    picture: z.string().url().optional(),
  }),
  cover_message: z.string().min(0).max(2000),
  cv_url: z.string().url().optional(),
  promo_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  // x-forwarded-for може бути "client, proxy1, proxy2"
  const rawIp = req.headers.get('x-forwarded-for') || '';
  const ip = rawIp.split(',')[0]?.trim() || 'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';

  try {
    const body = await req.json();
    const { job_id, artist, cover_message, cv_url, promo_url } = schema.parse(body);

    // 1) беремо email роботодавця з jobs (щоб не палити його на фронті)
    interface JobRow {
      id: number;
      title: string;
      apply_email: string;
      company_name: string;
    }
    const [rows] = await db.query(
      `SELECT j.id, j.title, j.apply_email, e.company_name
         FROM jobs j
         JOIN employers e ON e.id = j.employer_id
        WHERE j.id = ? AND j.is_active = 1
        LIMIT 1`,
      [job_id]
    ) as [JobRow[], unknown];
    if (!rows.length) {
      return NextResponse.json({ ok: false, error: 'Job not found or inactive' }, { status: 404 });
    }
    const job = rows[0];

    // 2) надсилаємо лист роботодавцю
    await sendEmployerEmail({
      to: job.apply_email,
      job,                 // { id, title, apply_email, company_name }
      artist,              // дані кандидата з форми
      cover_message,
      cv_url,
      promo_url
    });

    // 3) простий лог
    console.log('[apply.sent]', {
      job_id,
      employer: job.company_name,
      to: job.apply_email,
      ip, ua,
      artist_email: artist.email
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Показуємо причину 400
    if (error instanceof ZodError) {
      console.error('[apply.zod]', error);
      return NextResponse.json({ ok: false, error: 'Validation error', issues: error }, { status: 400 });
    }
    console.error('[apply.error]', error || error);
    return NextResponse.json({ ok: false, error: error || 'Unknown error' }, { status: 400 });
  }
}
