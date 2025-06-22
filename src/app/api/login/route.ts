// 👇 для pages/api
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }


    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM profiles WHERE email = ?",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "Incorrect email or password" }, {status: 401});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect email or password" }, {status: 401});
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("Missing JWT_SECRET in .env");
      return NextResponse.json({ error: "Server misconfiguration" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        sex: user.sex,
        country: user.country,
        role: user.role,
        date_of_birth: user.date_of_birth,
        height: user.height,
        weight: user.weight,
        video_url: user.video_url,
        pic_url: user.pic_url,
        pic_public_id: user.pic_public_id,
        biography: user.biography,
        experience: user.experience,
        email: user.email,
        instagram: user.instagram,
        facebook: user.facebook,
      },
      secret,
      { expiresIn: "7d" }
    );
    
    const response = NextResponse.json({ message: 'Login successful' });

    response.headers.set(
      'Set-Cookie',
      serialize('auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
