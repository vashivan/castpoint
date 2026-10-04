import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '../../../lib/db';
import { RowDataPacket } from 'mysql2';
import { getArtistFromCookies, setArtistCookie } from '@/lib/artistAuth';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Авторизація перед будь-якими діями
    const artist = await getArtistFromCookies();
    if (!artist) {
      return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
    }

    const { public_id } = await req.json();
    if (!public_id) {
      return NextResponse.json({ error: 'public_id is required' }, { status: 400 });
    }

    const trimmedPublicId = String(public_id).trim();

    // Перевірка користувача і що фото належить йому
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT pic_public_id FROM profiles WHERE id = ?',
      [artist.id]
    );
    if (users.length === 0) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
    }
    // Фото ще не збережене в профілі (щойно завантажене): нічого не видаляємо,
    // щоб ніхто не міг видалити чуже зображення за public_id.
    if (users[0].pic_public_id !== trimmedPublicId) {
      return NextResponse.json({ message: 'Фото не збережене в профілі', user: artist }, { status: 200 });
    }

    // Видаляємо зображення з Cloudinary
    const result = await cloudinary.uploader.destroy(trimmedPublicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      return NextResponse.json({ error: 'Failed to delete from Cloudinary' }, { status: 500 });
    }

    // Очищення полів
    await db.query(
      'UPDATE profiles SET pic_url = NULL, pic_public_id = NULL WHERE id = ?',
      [artist.id]
    );

    // Отримуємо оновленого користувача
    const [updatedUsers] = await db.query<RowDataPacket[]>(
      'SELECT * FROM profiles WHERE id = ?',
      [artist.id]
    );
    const { password: _, ...userWithoutPassword } = updatedUsers[0];

    const response = NextResponse.json(
      { message: 'Фото видалено', user: userWithoutPassword },
      { status: 200 }
    );
    return setArtistCookie(response, userWithoutPassword);
  } catch (error) {
    console.error('Помилка при видаленні фото:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
