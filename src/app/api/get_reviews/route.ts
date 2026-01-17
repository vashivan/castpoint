import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        id,
        artist_name,
        artist_instagram,
        company_name,
        position,
        place_of_work,
        content,
        created_at
      FROM reviews
      ORDER BY created_at DESC`
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Помилка отримання відгуків:", error);
    return NextResponse.json(
      { message: "Database error" },
      { status: 500 }
    );
  }
}
