// app/api/registration/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '../../../lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// helpers
const toStr = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const toNullStr = (v: unknown) => {
  const s = toStr(v);
  return s.length ? s : null;
};
const toNullInt = (v: unknown) => {
  const n = Number(toStr(v));
  return Number.isFinite(n) ? n : null;
};
const toNullDateISO = (v: unknown) => {
  const s = toStr(v);
  if (!s) return null;
  // приймаємо 'YYYY-MM-DD' або будь-що, що парситься Date
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  // зберігаємо як 'YYYY-MM-DD'
  const iso = d.toISOString().slice(0, 10);
  return iso;
};
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ----- 1) Зчитуємо всі поля з форми -----
    const first_name       = toStr(body.first_name);
    const second_name      = toStr(body.second_name);
    const name             = toStr(body.name) || `${first_name} ${second_name}`.trim();

    const sex              = toStr(body.sex);
    const country          = toStr(body.country);            // residence
    const phone            = toStr(body.phone);

    const role             = toStr(body.role);
    const height           = toNullInt(body.height);
    const weight           = toNullInt(body.weight);
    const bust             = toNullInt(body.bust);
    const waist            = toNullInt(body.waist);
    const hips             = toNullInt(body.hips);
    const skills           = toNullStr(body.skills);

    const date_of_birth    = toNullDateISO(body.date_of_birth);

    const video_url        = toNullStr(body.video_url);
    const resume_url       = toNullStr(body.resume_url);
    const pic_url          = toNullStr(body.pic_url);
    const pic_public_id    = toNullStr(body.pic_public_id);

    const biography        = toNullStr(body.biography);
    const experience       = toNullStr(body.experience);

    const email            = toStr(body.email).toLowerCase();
    const password         = toStr(body.password);

    const instagram        = toNullStr(body.instagram);
    const facebook         = toNullStr(body.facebook);

    // ----- 2) Мінімальна валідація -----
    if (!first_name && !name) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    if (!email || !isEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    // опціонально вимагати role/sex/country/date_of_birth:
    // if (!role) return NextResponse.json({ error: 'Role is required' }, { status: 400 });

    // ----- 3) Унікальність email -----
    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT id FROM profiles WHERE email = ? LIMIT 1',
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Profile with same Email already exists' }, { status: 400 });
    }

    // ----- 4) Хеш пароля -----
    const hashedPassword = await bcrypt.hash(password, 10);

    // ----- 5) INSERT (усі нові поля) -----
    const sql = `
      INSERT INTO profiles
      (
        name, first_name, second_name,
        sex, date_of_birth,
        country, phone,
        role, height, weight, skills,
        video_url, resume_url,
        pic_url, pic_public_id,
        biography, experience,
        email, password, instagram, facebook,
        bust, waist, hips,
        created_at
      )
      VALUES
      (
        ?, ?, ?,
        ?, ?,
        ?, ?, 
        ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        NOW()
      )
    `;

    const params = [
      name || null, first_name || null, second_name || null,
      sex || null, date_of_birth,
      country || null, phone || null,
      role || null, height, weight, skills,
      video_url, resume_url,
      pic_url, pic_public_id,
      biography, experience,
      email, hashedPassword, instagram, facebook,
      bust, waist, hips,
    ];

    const [result] = await db.query<ResultSetHeader>(sql, params);

    return NextResponse.json(
      { message: 'User registered successfully', id: (result as ResultSetHeader).insertId },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
