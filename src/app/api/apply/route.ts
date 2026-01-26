// src/app/api/apply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import db from "@/lib/db";
import { sendEmployerEmail } from "@/lib/mailer";
import { buildArtistProfilePdf } from "@/lib/pdf/ArtistProfilePdf";
import crypto from "crypto";

export const runtime = "nodejs";

// url preprocess (щоб не валилося на "" / null)
const asOptionalUrlOrPath = z.preprocess((v) => {
  if (v == null) return undefined;
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (!s || s === "null" || s === "undefined") return undefined;
  if (s.startsWith("www.")) return `https://${s}`;
  return s;
}, z.union([z.string().url(), z.string().startsWith("/")]).optional());

const uploadedImageSchema = z.object({
  secure_url: z.string().url(),
  public_id: z.string().min(3),
  bytes: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bust: z.number().int().positive().optional(),
  waist: z.number().int().positive().optional(),
  hips: z.number().int().positive().optional(),
  format: z.string().optional(),
});

// schema для FormData (images приходить JSON string)
const schema = z.object({
  job_id: z.coerce.number(),
  artist: z.object({
    full_name: z.string().min(2),
    email: z.string().email(), // ⚠️ зберігаємо для менеджера/логів, але НЕ показуємо роботодавцю
    date_of_birth: z.string().optional(),
    phone: z.string().optional(),
    instagram: z.string().optional(),
    country: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    bust: z.string().optional(),
    waist: z.string().optional(),
    hips: z.string().optional(),
    experience: z.string().optional(),
    biography: z.string().optional(),
    picture: asOptionalUrlOrPath,
  }),
  cover_message: z.string().max(2000).optional().default(""),
  promo_url: asOptionalUrlOrPath || undefined,

  // images як JSON string у FormData
  images: z.preprocess((v) => {
    if (v == null) return undefined;
    if (Array.isArray(v)) return v;
    if (typeof v !== "string") return v;
    const s = v.trim();
    if (!s) return undefined;
    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  }, z.array(uploadedImageSchema).max(5).optional()),
});

type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

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


function extFromContentType(ct?: string | null) {
  if (!ct) return "jpg";
  const c = ct.toLowerCase();
  if (c.includes("png")) return "png";
  if (c.includes("webp")) return "webp";
  if (c.includes("jpeg") || c.includes("jpg")) return "jpg";
  return "jpg";
}

async function fetchAsAttachment(url: string, filenameBase: string): Promise<MailAttachment> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${url} (${res.status})`);
  }

  const contentType = res.headers.get("content-type") ?? undefined;
  const ab = await res.arrayBuffer();
  const content = Buffer.from(ab);

  const ext = extFromContentType(contentType);
  return {
    filename: `${filenameBase}.${ext}`,
    content,
    contentType,
  };
}

export function createStatusToken() {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
}

export async function POST(req: NextRequest) {
  const rawIp = req.headers.get("x-forwarded-for") || "";
  const ip = rawIp.split(",")[0]?.trim() || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  try {
    const fd = await req.formData();

    // 1) text fields (FormData -> object)
    const body = {
      job_id: fd.get("job_id"),
      artist: {
        full_name: fd.get("artist_full_name"),
        email: fd.get("artist_email"),
        date_of_birth: fd.get("artist_date_of_birth") ?? undefined,
        phone: fd.get("artist_phone") ?? undefined,
        instagram: fd.get("artist_instagram") ?? undefined,
        country: fd.get("artist_country") ?? undefined,
        weight: fd.get("artist_weight") ?? undefined,
        height: fd.get("artist_height") ?? undefined,
        bust: fd.get("artist_bust") ?? undefined,
        waist: fd.get("artist_waist") ?? undefined,
        hips: fd.get("artist_hips") ?? undefined,
        experience: fd.get("artist_experience") ?? undefined,
        biography: fd.get("artist_biography") ?? undefined,
        picture: fd.get("artist_picture") ?? undefined,
      },
      cover_message: fd.get("cover_message") ?? "",
      promo_url: fd.get("promo_url") ?? undefined,

      // ✅ images з фронту: fd.append("images", JSON.stringify([...]))
      images: fd.get("images") ?? undefined,
    };

    const { job_id, artist, cover_message, promo_url, images } = schema.parse(body);

    // 2) job з jobs
    interface JobRow {
      id: number;
      title: string;
      apply_email: string;
      company_name?: string | null;
    }

    const [rows] = (await db.query(
      `SELECT id, title, apply_email, company_name
         FROM jobs
        WHERE id = ? AND is_active = 1
        LIMIT 1`,
      [job_id]
    )) as [JobRow[], unknown];

    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Job not found or inactive" }, { status: 404 });
    }

    const job = rows[0];

    const toApplicationCode = (id: number) => `CP-${String(id).padStart(6, "0")}`;
    const token = createStatusToken();

    const [res]: any = await db.execute(
      `INSERT INTO applications 
    (job_id, artist_email, sent_email_status, sent_email_error, created_at, application_title, status_token, status_token_expires_at)
   VALUES
    (?, ?, 'pending', NULL, NOW(), ?, ?, DATE_ADD(NOW(), INTERVAL 14 DAY))`,
      [job_id, artist.email, job.title, token]
    );


    const numericId = (res as any).insertId as number;
    const applicationCode = toApplicationCode(numericId);

    await db.execute(
      `UPDATE applications SET application_code = ? WHERE id = ?`,
      [applicationCode, numericId]
    );

    // 3) normalize promo_url to absolute if it’s "/path"
    const origin = req.nextUrl.origin;
    const promoFinal = promo_url?.startsWith("/") ? `${origin}${promo_url}` : promo_url;

    const base = process.env.APP_URL; // https://castpoint.art

    const approveUrl = `${base}/decision?action=approved&token=${token}`;
    const rejectUrl = `${base}/decision?action=rejected&token=${token}`;


    // 4) PDF (NO CONTACTS)
    const pdfBuffer = await buildArtistProfilePdf({
      jobTitle: job.title,
      companyName: job.company_name ?? null,
      artist: {
        full_name: artist.full_name,
        country: artist.country,
        date_of_birth: artist.date_of_birth,
        height: artist.height,
        weight: artist.weight,
        bust: artist.bust,
        waist: artist.waist,
        hips: artist.hips,
        experience: artist.experience,
        biography: artist.biography,
        picture: artist.picture,
      },
      cover_message,
      promo_url: promoFinal,
      // якщо хочеш ще й в PDF — додай сюди images і оброби в buildArtistProfilePdf
      // images: images ?? [],
    });

    // 5) Build email attachments from Cloudinary URLs
    const safeName = artist.full_name.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
    const imgList = (images ?? []).slice(0, 5);

    const photoAttachments: MailAttachment[] = await Promise.all(
      imgList.map((img, idx) =>
        fetchAsAttachment(img.secure_url, `${safeName}_photo_${idx + 1}`)
      )
    );

    const pdfFilename = `${safeName || "Artist"}_Castpoint_Profile.pdf`;

    // 6) send email (NO CONTACTS in html) + PDF + image attachments
    await sendEmployerEmail({
      to: job.apply_email,
      job,
      artist_public: { full_name: artist.full_name },
      artist_promo_url: promoFinal,
      cover_message,
      urls: {
        approveUrl: approveUrl,
        rejectUrl: rejectUrl,
      },
      pdf: {
        filename: pdfFilename,
        content: pdfBuffer,
      },
      attachments: photoAttachments, // ✅ нове поле
    });

    await db.execute(
      `UPDATE applications
         SET sent_email_status='sent',
             sent_email_error=NULL,
             application_code=?
       WHERE id=?`,
      [applicationCode, numericId]
    );

    // ✅ тут можна видалити з Cloudinary після успіху
    // await deleteCloudinaryPublicIds(imgList.map(i => i.public_id));

    // console.log("[apply.sent]", {
    //   job_id,
    //   to: job.apply_email,
    //   ip,
    //   ua,
    //   artist_email: artist.email,
    //   images: imgList.length,
    // });

    const captions = [
      "New Artist Application",
      `Name: ${artist.full_name || "—"}`,
      `Email: ${artist.email || "—"}`,
      `Phone: ${artist.phone || "—"}`,
      `Code: ${applicationCode}`,
      `Title: ${job.title}`
    ]
      .filter(Boolean)
      .join("\n");

    await sendToTelegram(
      captions
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", issues: error.issues },
        { status: 400 }
      );
    }
    console.error("[apply.error]", error);
    return NextResponse.json({ ok: false, error: "Unknown error" }, { status: 400 });
  }
}
