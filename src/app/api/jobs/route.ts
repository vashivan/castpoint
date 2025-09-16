// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get('q') || '').trim();
  const contract = searchParams.get('contract') as 'short'|'medium'|'long'|null;
  const location = (searchParams.get('location') || '').trim();

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12', 10)));
  const offset = (page - 1) * pageSize;

  // Будуємо WHERE + масив значень для ?
  const where: string[] = [];
  const paramsCount: any[] = [];
  const paramsData: any[] = [];

  // Пошук
  if (q) {
    where.push('(j.title LIKE ? OR j.description LIKE ? OR e.company_name LIKE ? OR j.location LIKE ?)');
    const like = `%${q}%`;
    paramsCount.push(like, like, like, like);
    paramsData.push(like, like, like, like);
  }

  if (contract && ['short','medium','long'].includes(contract)) {
    where.push('j.contract_type = ?');
    paramsCount.push(contract);
    paramsData.push(contract);
  }

  if (location) {
    where.push('j.location LIKE ?');
    const likeLoc = `%${location}%`;
    paramsCount.push(likeLoc);
    paramsData.push(likeLoc);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    // total
    const [cntRows] = await db.query<any[]>(
      `SELECT COUNT(*) AS total
       FROM jobs j
       JOIN employers e ON e.id = j.employer_id
       ${whereSql}`,
      paramsCount
    );
    const total = cntRows[0]?.total || 0;

    // data (сортуємо по id, щоб не залежати від наявності created_at)
    const [rows] = await db.query<any[]>(
      `SELECT j.id, j.title, j.location, j.contract_type, j.salary_from, j.salary_to, j.currency,
              j.description, e.company_name
       FROM jobs j
       JOIN employers e ON e.id = j.employer_id
       ${whereSql}
       ORDER BY j.id DESC
       LIMIT ? OFFSET ?`,
      [...paramsData, pageSize, offset]
    );

    return NextResponse.json({
      ok: true,
      total,
      page,
      pageSize,
      jobs: rows,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
