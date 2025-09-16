// src/app/api/jobs/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../../lib/db';

const schema = z.object({
  employer: z.object({
    company_name: z.string().min(2),
    contact_name: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
  }),
  job: z.object({
    title: z.string().min(3),
    location: z.string().optional(),
    contract_type: z.enum(['short','medium','long']).default('short'),
    salary_from: z.number().optional(),
    salary_to: z.number().optional(),
    currency: z.string().default('USD'),
    description: z.string().min(10),
    apply_email: z.string().email()
  })
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employer, job } = schema.parse(body);

    // upsert employer
    const [emp] = await db.query(
      `INSERT INTO employers (company_name, contact_name, email, phone, website)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE company_name=VALUES(company_name), contact_name=VALUES(contact_name),
                               phone=VALUES(phone), website=VALUES(website)`,
      [employer.company_name, employer.contact_name || null, employer.email, employer.phone || null, employer.website || null]
    );

    // get employer id (insertId може бути 0 при DUPLICATE; беремо по email)
    const [row] = await db.query(
      `SELECT id FROM employers WHERE email = ? LIMIT 1`,
      [employer.email]
    );
    const employerId = row[0].id;

    await db.query(
      `INSERT INTO jobs (employer_id, title, location, contract_type, salary_from, salary_to, currency, description, apply_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employerId,
        job.title,
        job.location || null,
        job.contract_type,
        job.salary_from ?? null,
        job.salary_to ?? null,
        job.currency || 'USD',
        job.description,
        job.apply_email
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error }, { status: 400 });
  }
}
