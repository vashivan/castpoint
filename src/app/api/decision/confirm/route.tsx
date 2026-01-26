import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendArtistStatusEmail } from "@/lib/mailerStatus";

async function sendToTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");
  if (!chatId) throw new Error("Missing TELEGRAM_CHAT_ID");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed (${res.status}): ${JSON.stringify(data)}`);
  }
}

export async function POST(req: Request) {
  const { token, action } = await req.json();

  if (!token || !["approved", "rejected"].includes(action)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const [rows]: any = await db.execute(
    `SELECT id, status, artist_email, application_title, application_code
       FROM applications
      WHERE status_token = ?
      LIMIT 1`,
    [token]
  );


  const app = rows?.[0];
  if (!app) return NextResponse.json({ ok: false }, { status: 404 });

  // 🔒 idempotent
  // if (app.status !== "under review") {
  //   return NextResponse.json({ ok: true, already: true });
  // }

  await db.execute(
    `UPDATE applications
        SET status = ?, status_updated_at = NOW()
      WHERE id = ?`,
    [action, app.id]
  );

  await sendArtistStatusEmail({
    to: app.artist_email,
    jobTitle: app.application_title,
    status: action,
    appCode: app.application_code,
  });

  const captions = [
      `Application <strong>${action}</strong>`,
      `Email: ${app.artist_email || "—"}`,
      `Code: ${app.application_code}`,
      `Title: ${app.application_title}`
    ]
      .filter(Boolean)
      .join("\n");

  await sendToTelegram(captions);

  return NextResponse.json({ ok: true });
}
