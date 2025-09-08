import { NextRequest, NextResponse } from "next/server";
// import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => {
      const [key, ...v] = c.split("=");
      return [key, decodeURIComponent(v.join("="))];
    }));
    const token = cookies.auth;
    if (!token) return NextResponse.json({ error: "Не авторизований" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      id: number,
      first_name: string,
      second_name: string,
      name: string,
      sex: string,
      country: string,
      role: string,
      date_of_birth: string,
      height: number,
      weight: number,
      video_url: string,
      pic_url: string,
      pic_public_id: string,
      biography: string,
      experience: string,
      email: string,
      instagram?: string,
      facebook?: string
    };

    return NextResponse.json({ user: decoded });
  } catch (error) {
    console.log("Internal error", error);
    return NextResponse.json({ error: "Не авторизований" }, { status: 401 });
  }
}
