import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db'; // Шлях до підключення бази (у тебе вже має бути)
import 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      instagram,
      company_name,
      position,
      place_of_work,
      content,
      anonymous,
    } = body;

    console.log('Received body:', body);
    console.log('Received body:', body);
    console.log('content:', content);


    if (anonymous === true) {
      const name = 'Anonymous';
      const instagram = 'Anonymous';

      await db.query(
        `INSERT INTO reviews 
        (artist_name, company_name, position, place_of_work, content, artist_instagram) 
       VALUES (?, ?, ?, ?, ?, ?)`,
        [name, company_name, position, place_of_work, content, instagram]
      );
    } else {
      await db.query(
        `INSERT INTO reviews 
        (artist_name, company_name, position, place_of_work, content, artist_instagram) 
       VALUES (?, ?, ?, ?, ?, ?)`,
        [name, company_name, position, place_of_work, content, instagram]
      );
    }

    return NextResponse.json({ message: 'Review created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
