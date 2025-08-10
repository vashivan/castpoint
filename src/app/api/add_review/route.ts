import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db'; // Шлях до підключення бази (у тебе вже має бути)
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      artist_id,
      company_name,
      position,
      place_of_work,
      content,
    } = body;

    console.log('Received body:', body);
    console.log('Received body:', body);
    console.log('artist_id:', artist_id);
    console.log('content:', content);

    // Валідація
    if (!artist_id || !content) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // SQL-запит
    await db.query(
      `INSERT INTO reviews 
        (artist_id, company_name, position, place_of_work, content) 
       VALUES (?, ?, ?, ?, ?)`,
      [artist_id, company_name, position, place_of_work, content]
    );

    return NextResponse.json({ message: 'Review created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
