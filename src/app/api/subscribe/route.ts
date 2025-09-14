import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db'; // Шлях до підключення бази (у тебе вже має бути)
import 'mysql2';
import { subscribeEmail } from '../../../lib/subscribe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {email} = body;

    console.log('Received body:', body);

    // SQL-запит
    await db.query(
      `INSERT INTO subscribe 
        (email) 
       VALUES (?)`,
      [email]
    );

    await subscribeEmail(email);

    return NextResponse.json({ message: 'Review created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
