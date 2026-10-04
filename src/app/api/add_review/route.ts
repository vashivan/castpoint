import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getArtistFromCookies } from '@/lib/artistAuth';

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: NextRequest) {
  try {
    // Only signed-in artists can review; name and Instagram come from the session, not the request body.
    const artist = await getArtistFromCookies();
    if (!artist) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const company_name = clean(body.company_name, 255);
    const position = clean(body.position, 255);
    const place_of_work = clean(body.place_of_work, 255);
    const content = clean(body.content, 5000);
    const anonymous = body.anonymous === true;

    if (!company_name || !content) {
      return NextResponse.json({ message: 'Company and review text are required' }, { status: 400 });
    }

    const name = anonymous ? 'Anonymous' : artist.name || [artist.first_name, artist.second_name].filter(Boolean).join(' ');
    const instagram = anonymous ? 'Anonymous' : artist.instagram ?? null;

    await db.query(
      `INSERT INTO reviews
        (artist_name, company_name, position, place_of_work, content, artist_instagram)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, company_name, position, place_of_work, content, instagram]
    );

    return NextResponse.json({ message: 'Review created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
