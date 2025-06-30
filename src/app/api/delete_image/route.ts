import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { cookies } from "next/headers";


cloudinary.config({
  cloud_name: "dkchysebn",
  api_key: "145289783927229",
  api_secret: "7qoYAYHu6Pq__ssQSR7YoZt8goA",
});


export async function POST(req: NextRequest) {
  try {
    const { public_id } = await req.json();
    if (!public_id) {
      return NextResponse.json({ error: 'public_id is required' }, { status: 400 });
    }

    const trimmedPublicId = public_id.trim();

    // Видаляємо зображення з Cloudinary
    const result = await cloudinary.uploader.destroy(trimmedPublicId);
    console.log('Cloudinary delete result:', result);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return NextResponse.json({ error: 'Failed to delete from Cloudinary' }, { status: 500 });
    }

    // Авторизація
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;


    if (!token) {
      return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    const userId = decoded.id;

    // Перевірка користувача
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT * FROM profiles WHERE id = ?',
      [userId]
    );
    if (users.length === 0) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
    }

    // Очищення полів
    await db.query(
      'UPDATE profiles SET pic_url = NULL, pic_public_id = NULL WHERE id = ?',
      [userId]
    );

    // Отримуємо оновленого користувача
    const [updatedUsers] = await db.query<RowDataPacket[]>(
      'SELECT * FROM profiles WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedUsers[0];
    const { password, ...userWithoutPassword } = updatedUser;

    // Створюємо новий JWT
    const newToken = jwt.sign(userWithoutPassword, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    // Відповідь з оновленим користувачем + оновлена кука
    const response = NextResponse.json(
      { message: 'Фото видалено', user: userWithoutPassword },
      { status: 200 }
    );

    response.cookies.set('auth', newToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Помилка при видаленні фото:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
};