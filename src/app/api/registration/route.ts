// app/api/registration/route.ts

import { NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db"; // шляхи можуть відрізнятись у твоєму проєкті
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, sex, country, role, date_of_birth, height, weight, video_url, pic_url, pic_public_id, biography, experience, email, password, instagram, facebook } = body;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("No JWT_SECRET in .env");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  try {
    const [existingUsers] = await db.query<RowDataPacket[]>(
      "SELECT id FROM profiles WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Profile with same Email is already exist" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO profiles (name, sex, country, role, date_of_birth, height, weight, video_url, pic_url, pic_public_id, biography, experience, email, password, instagram, facebook)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sex, country, role, date_of_birth, height, weight, video_url, pic_url, pic_public_id, biography, experience, email, hashedPassword, instagram, facebook]
    );

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
