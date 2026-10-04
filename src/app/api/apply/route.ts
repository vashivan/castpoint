// src/app/api/apply/route.ts
//
// A signed-in artist applies to an active job. We store the application,
// build a PDF profile, e-mail it (plus up to 5 photos) to the employer with
// approve / reject links, and post a note to the team's Telegram.

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import db from "@/lib/db";
import { getArtistFromCookies } from "@/lib/artistAuth";
import { sendEmployerEmail } from "@/lib/mailer";
import { buildArtistProfilePdf } from "@/lib/pdf/ArtistProfilePdf";
import { escapeTelegramHtml, sendTelegramMessage } from "@/lib/telegram";
import { parseApplyForm } from "@/lib/applications/applySchema";
import { fetchImageAttachment, fileSafeName } from "@/lib/applications/attachments";

export const runtime = "nodejs";

interface JobRow extends RowDataPacket {
  id: number;
  title: string;
  apply_email: string | null;
  company_name: string | null;
}

const toApplicationCode = (id: number) => `CP-${String(id).padStart(6, "0")}`;
const nullable = (value?: string) => value?.trim() || null;

async function setEmailStatus(applicationId: number, status: "sent" | "failed", error: string | null = null) {
  await db.execute("UPDATE applications SET sent_email_status = ?, sent_email_error = ? WHERE id = ?", [
    status,
    error,
    applicationId,
  ]);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Only signed-in artists apply; their e-mail comes from the session
    const session = await getArtistFromCookies();
    if (!session?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { job_id, artist, cover_message, promo_url, images } = parseApplyForm(await req.formData());

    // 2. Job must exist and be published
    const [rows] = await db.query<JobRow[]>(
      "SELECT id, title, apply_email, company_name FROM jobs WHERE id = ? AND is_active = 1 LIMIT 1",
      [job_id]
    );
    const job = rows[0];
    if (!job) {
      return NextResponse.json({ ok: false, error: "Job not found or inactive" }, { status: 404 });
    }

    const origin = req.nextUrl.origin;
    const promoFinal = promo_url?.startsWith("/") ? `${origin}${promo_url}` : promo_url;
    const coverMessage = cover_message.trim() || null;
    const token = crypto.randomBytes(32).toString("hex");

    // 3. Store the application
    const [insert] = await db.execute<ResultSetHeader>(
      `INSERT INTO applications (
         job_id, artist_name, artist_email, artist_phone, artist_instagram, artist_country,
         artist_date_of_birth, artist_height, artist_weight, artist_bust, artist_waist, artist_hips,
         artist_experience, artist_biography, artist_picture, promo_url, cover_message,
         application_title, status, sent_email_status, sent_email_error,
         status_token, status_token_expires_at, created_at, updated_at
       ) VALUES (
         ?, ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, 'pending', 'pending', NULL,
         ?, DATE_ADD(NOW(), INTERVAL 14 DAY), NOW(), NOW()
       )`,
      [
        job_id,
        artist.full_name,
        session.email,
        nullable(artist.phone),
        nullable(artist.instagram),
        nullable(artist.country),
        nullable(artist.date_of_birth),
        nullable(artist.height),
        nullable(artist.weight),
        nullable(artist.bust),
        nullable(artist.waist),
        nullable(artist.hips),
        nullable(artist.experience),
        nullable(artist.biography),
        artist.picture ?? null,
        promoFinal ?? null,
        coverMessage,
        job.title,
        token,
      ]
    );

    const applicationId = insert.insertId;
    const applicationCode = toApplicationCode(applicationId);
    await db.execute("UPDATE applications SET application_code = ? WHERE id = ?", [applicationCode, applicationId]);

    // 4. E-mail the employer: PDF profile, photos, approve / reject links
    if (!job.apply_email) {
      await setEmailStatus(applicationId, "failed", "Job has no apply_email");
    } else {
      try {
        const base = process.env.APP_URL || origin;
        const decisionUrl = (action: string) => `${base}/decision?action=${action}&token=${token}`;
        const name = fileSafeName(artist.full_name);

        const [pdf, photos] = await Promise.all([
          buildArtistProfilePdf({
            jobTitle: job.title,
            companyName: job.company_name,
            // Contact details stay out of the PDF: employers reply through the decision links
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
          }),
          Promise.all((images ?? []).map((img, i) => fetchImageAttachment(img.secure_url, `${name}_photo_${i + 1}`))),
        ]);

        await sendEmployerEmail({
          to: job.apply_email,
          job,
          artist_public: { full_name: artist.full_name },
          artist_promo_url: promoFinal,
          cover_message,
          urls: { approveUrl: decisionUrl("approved"), rejectUrl: decisionUrl("rejected") },
          pdf: { filename: `${name}_Castpoint_Profile.pdf`, content: pdf },
          attachments: photos,
        });
        await setEmailStatus(applicationId, "sent");
      } catch (emailError) {
        console.error("[apply.email.error]", emailError);
        await setEmailStatus(applicationId, "failed", emailError instanceof Error ? emailError.message : "Unknown email error");
      }
    }

    // 5. Tell the team
    await sendTelegramMessage(
      [
        "🎭 <b>New Artist Application</b>",
        "",
        `<b>Name:</b> ${escapeTelegramHtml(artist.full_name)}`,
        `<b>Email:</b> ${escapeTelegramHtml(session.email)}`,
        `<b>Phone:</b> ${escapeTelegramHtml(artist.phone || "—")}`,
        `<b>Country:</b> ${escapeTelegramHtml(artist.country || "—")}`,
        "",
        `<b>Code:</b> ${applicationCode}`,
        `<b>Job:</b> ${escapeTelegramHtml(job.title)}`,
      ].join("\n")
    );

    return NextResponse.json(
      { ok: true, application: { id: applicationId, code: applicationCode, status: "pending" } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("[apply.validation]", error.issues);
      return NextResponse.json({ ok: false, error: "Validation error", issues: error.issues }, { status: 400 });
    }
    console.error("[apply.error]", error);
    return NextResponse.json({ ok: false, error: "Failed to submit application" }, { status: 500 });
  }
}
