// src/app/api/employers/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import db from '@/lib/db';

const schema = z.object({
  company_name: z.string().min(2).max(255),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_name, email } = schema.parse(body);

    await db.query(
      `INSERT INTO employer_waitlist (company_name, email)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)`,
      [company_name, email]
    );

    return NextResponse.json({ ok: true, message: 'You are on the waitlist!' });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: 'Validation error', issues: error }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: error || 'Unknown error' }, { status: 400 });
  }
}
