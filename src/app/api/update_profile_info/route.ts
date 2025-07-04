import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, sex, country, role, date_of_birth, height, weight, video_url, pic_url, pic_public_id, biography, experience, email, password, instagram, facebook } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;

    if (!token) {
      return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    const userId = decoded.id;

    const [users] = await db.query<RowDataPacket[]>("SELECT * FROM profiles WHERE id = ?", [userId]);
    if (users.length === 0) return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });

    let updateQuery = "UPDATE profiles SET";
    let values: (string | number)[] = [];
    let updates: string[] = [];

    if (name) { updates.push("name = ?"); values.push(name); }
    if (height) { updates.push("height = ?"); values.push(height); }
    if (weight) { updates.push("weight = ?"); values.push(weight); }
    if (email) { updates.push("email = ?"); values.push(email); }
    if (video_url) { updates.push("video_url = ?"); values.push(video_url); }
    if (pic_url) { updates.push("pic_url = ?"); values.push(pic_url); }
    if (pic_public_id) { updates.push("pic_public_id = ?"); values.push(pic_public_id); }
    if (biography) { updates.push("biography = ?"); values.push(biography); }
    if (experience) { updates.push("experience = ?"); values.push(experience); }
    if (instagram) { updates.push("instagram = ?"); values.push(instagram); }
    if (facebook) { updates.push("facebook = ?"); values.push(facebook); }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Немає даних для оновлення" }, { status: 400 });
    }

    updateQuery += " " + updates.join(", ") + " WHERE id = ?";
    values.push(userId);

    await db.query(updateQuery, values);

    const [updatedUsers] = await db.query<RowDataPacket[]>("SELECT * FROM profiles WHERE id = ?", [userId]);
    const updatedUser = updatedUsers[0];

    const { password: _, ...userWithoutPassword } = updatedUser;

    const newToken = jwt.sign(userWithoutPassword, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    const response = NextResponse.json({ message: "Дані успішно оновлено", user: userWithoutPassword }, { status: 200 });

    response.cookies.set("auth", newToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("Помилка при оновленні користувача:", error);
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}