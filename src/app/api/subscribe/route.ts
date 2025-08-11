import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db'; // Шлях до підключення бази (у тебе вже має бути)
import { RowDataPacket } from 'mysql2';
import 'mysql2';

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

    return NextResponse.json({ message: 'Review created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
