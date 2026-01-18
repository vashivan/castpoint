// src/app/api/apply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import db from "@/lib/db";
import { sendEmployerEmail } from "@/lib/mailer";
import { buildArtistProfilePdf } from "@/lib/pdf/ArtistProfilePdf";

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

// text schema (бо FormData)
const schema = z.object({
  job_id: z.coerce.number(),
  artist: z.object({
    full_name: z.string().min(2),
    email: z.string().email(), // ⚠️ зберігаємо для менеджера/логів, але НЕ показуємо роботодавцю
    date_of_birth: z.string(),
    phone: z.string().optional(),
    instagram: z.string().optional(),
    country: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    experience: z.string().optional(),
    biography: z.string().optional(),
    picture: asOptionalUrlOrPath,
  }),
  cover_message: z.string().max(2000).optional().default(""),
  promo_url: asOptionalUrlOrPath,
});

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB each
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

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
        date_of_birth: fd.get("artist_date_of_birth"),
        phone: fd.get("artist_phone") ?? undefined,
        instagram: fd.get("artist_instagram") ?? undefined,
        country: fd.get("artist_country") ?? undefined,
        weight: fd.get("artist_weight") ?? undefined,
        height: fd.get("artist_height") ?? undefined,
        experience: fd.get("artist_experience") ?? undefined,
        biography: fd.get("artist_biography") ?? undefined,
        picture: fd.get("artist_picture") ?? undefined,
      },
      cover_message: fd.get("cover_message") ?? "",
      promo_url: fd.get("promo_url") ?? undefined,
    };

    const { job_id, artist, cover_message, promo_url } = schema.parse(body);

    // 2) photos (validate, but НЕ робимо email attachments — лише для PDF)
    const photoFiles = (fd.getAll("photos").filter(Boolean) as File[]).slice(0, MAX_FILES);

    for (const f of photoFiles) {
      if (!ALLOWED_MIME.has(f.type)) {
        return NextResponse.json({ ok: false, error: `Unsupported file type: ${f.type}` }, { status: 400 });
      }
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json({ ok: false, error: `File too large: ${f.name} (max 5MB)` }, { status: 400 });
      }
    }
    
    // 3) job з jobs
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

    const job = rows[0];

    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Job not found or inactive" }, { status: 404 });
    }

    const toApplicationCode = (id: number) => `CP-${String(id).padStart(6, "0")}`;


    const [res] = await db.execute(
      `INSERT INTO applications 
   (job_id, artist_email, sent_email_status, sent_email_error, created_at, application_title)
   VALUES (?, ?, 'pending', NULL, NOW(), ?)`,
      [job_id, artist.email, job.title]
    );

    const numericId = (res as any).insertId as number;   // реальний id заявки
    const applicationCode = toApplicationCode(numericId); // CP-000123


    // 4) normalize promo_url to absolute if it’s "/path"
    const origin = req.nextUrl.origin;
    const promoFinal = promo_url?.startsWith("/") ? `${origin}${promo_url}` : promo_url;

    // 5) PDF (NO CONTACTS)
    const pdfBuffer = await buildArtistProfilePdf({
      jobTitle: job.title,
      companyName: job.company_name ?? null,
      artist: {
        full_name: artist.full_name,
        country: artist.country,
        date_of_birth: artist.date_of_birth,
        height: artist.height,
        weight: artist.weight,
        experience: artist.experience,
        biography: artist.biography,
        picture: artist.picture,
      },
      cover_message,
      promo_url: promoFinal,
    });

    // 6) send email (NO CONTACTS in html) + PDF attachment
    await sendEmployerEmail({
      to: job.apply_email,
      job,
      artist_public: { full_name: artist.full_name },
      artist_promo_url: promoFinal,
      photos: photoFiles,
      cover_message,
      pdf: {
        filename: `${artist.full_name.replace(/\s+/g, "_")}_Castpoint_Profile.pdf`,
        content: pdfBuffer,
      },
    });

    await db.execute(
      `UPDATE applications
     SET sent_email_status='under review',
         sent_email_error=NULL,
         application_code=?
     WHERE id=?`,
      [applicationCode, numericId]
    );
 
  // 7) internal log (contact is ok here)
  console.log("[apply.sent]", {
    job_id,
    to: job.apply_email,
    ip,
    ua,
    artist_email: artist.email,
    photos: photoFiles.length,
  });

  return NextResponse.json({ ok: true });
} catch (error) {
  if (error instanceof ZodError) {
    return NextResponse.json({ ok: false, error: "Validation error", issues: error.issues }, { status: 400 });
  }
  console.error("[apply.error]", error);
  return NextResponse.json({ ok: false, error: "Unknown error" }, { status: 400 });
}
}
