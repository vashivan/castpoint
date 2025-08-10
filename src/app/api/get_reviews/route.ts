import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    // Отримуємо всіх користувачів з таблиці StudentsList
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
      reviews.id,
      reviews.artist_id,
      profiles.name AS artist_name,
      profiles.instagram AS artist_instagram,
      reviews.company_name,
      reviews.position,
      reviews.place_of_work,
      reviews.content,
      reviews.created_at
    FROM reviews
    JOIN profiles ON reviews.artist_id = profiles.id
    ORDER BY reviews.created_at DESC`
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Помилка отримання користувачів:", error);
    NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}