import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getArtistFromCookies } from "@/lib/artistAuth";

export const runtime = "nodejs";

// Lists the signed-in artist's own applications. The email comes from the
// session, never from the query string, so nobody can read someone else's list.
export async function GET() {
  const artist = await getArtistFromCookies();
  if (!artist?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, job_id, application_code, sent_email_status, created_at, application_title, status
       FROM applications
       WHERE artist_email = ?
       ORDER BY created_at DESC`,
      [artist.email]
    );

    return NextResponse.json({ ok: true, applications: rows });
  } catch (err) {
    console.error("[my_application]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
