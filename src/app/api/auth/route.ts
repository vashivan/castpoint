import { NextResponse } from "next/server";
import { getArtistFromCookies } from "@/lib/artistAuth";

export async function GET() {
  const user = await getArtistFromCookies();
  if (!user) return NextResponse.json({ error: "Не авторизований" }, { status: 401 });

  return NextResponse.json({ user });
}
