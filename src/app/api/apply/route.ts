// src/app/api/apply/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import db from "@/lib/db";
import { sendEmployerEmail } from "@/lib/mailer";
import { buildArtistProfilePdf } from "@/lib/pdf/ArtistProfilePdf";
import crypto from "crypto";

export const runtime = "nodejs";

// -----------------------------
// URL preprocess
// -----------------------------

const asOptionalUrlOrPath = z.preprocess((v) => {
  if (v == null) return undefined;

  if (typeof v !== "string") {
    return v;
  }

  const s = v.trim();

  if (!s || s === "null" || s === "undefined") {
    return undefined;
  }

  if (s.startsWith("www.")) {
    return `https://${s}`;
  }

  return s;
}, z.union([z.string().url(), z.string().startsWith("/")]).optional());

// -----------------------------
// Uploaded image schema
// -----------------------------

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

// -----------------------------
// Application schema
// -----------------------------

const schema = z.object({
  job_id: z.coerce.number().int().positive(),

  artist: z.object({
    full_name: z.string().min(2),

    email: z.string().email(),

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

  cover_message: z
    .string()
    .max(2000)
    .optional()
    .default(""),

  promo_url: asOptionalUrlOrPath,

  images: z.preprocess((v) => {
    if (v == null) {
      return undefined;
    }

    if (Array.isArray(v)) {
      return v;
    }

    if (typeof v !== "string") {
      return v;
    }

    const s = v.trim();

    if (!s) {
      return undefined;
    }

    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  }, z.array(uploadedImageSchema).max(5).optional()),
});

// -----------------------------
// Types
// -----------------------------

type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

interface JobRow {
  id: number;
  title: string;

  apply_email: string | null;

  company_name?: string | null;
}

// -----------------------------
// Helpers
// -----------------------------

function createStatusToken() {
  return crypto.randomBytes(32).toString("hex");
}

function toApplicationCode(id: number) {
  return `CP-${String(id).padStart(6, "0")}`;
}

function nullableString(value?: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

async function sendToTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[apply.telegram] Telegram env variables are missing"
    );

    return;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",

        headers: {
          "content-type": "application/json",
        },

        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      console.error(
        "[apply.telegram.error]",
        await res.text()
      );
    }
  } catch (error) {
    console.error(
      "[apply.telegram.error]",
      error
    );
  }
}

function extFromContentType(
  ct?: string | null
) {
  if (!ct) {
    return "jpg";
  }

  const c = ct.toLowerCase();

  if (c.includes("png")) {
    return "png";
  }

  if (c.includes("webp")) {
    return "webp";
  }

  if (
    c.includes("jpeg") ||
    c.includes("jpg")
  ) {
    return "jpg";
  }

  return "jpg";
}

async function fetchAsAttachment(
  url: string,
  filenameBase: string
): Promise<MailAttachment> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch image: ${url} (${res.status})`
    );
  }

  const contentType =
    res.headers.get("content-type") ??
    undefined;

  const ab = await res.arrayBuffer();

  const content = Buffer.from(ab);

  const ext =
    extFromContentType(contentType);

  return {
    filename: `${filenameBase}.${ext}`,
    content,
    contentType,
  };
}

// -----------------------------
// POST /api/apply
// -----------------------------

export async function POST(
  req: NextRequest
) {
  let applicationId: number | null = null;

  try {
    // -------------------------
    // 1. Read FormData
    // -------------------------

    const fd = await req.formData();

    const body = {
      job_id: fd.get("job_id"),

      artist: {
        full_name:
          fd.get("artist_full_name"),

        email:
          fd.get("artist_email"),

        date_of_birth:
          fd.get(
            "artist_date_of_birth"
          ) ?? undefined,

        phone:
          fd.get("artist_phone") ??
          undefined,

        instagram:
          fd.get(
            "artist_instagram"
          ) ?? undefined,

        country:
          fd.get("artist_country") ??
          undefined,

        weight:
          fd.get("artist_weight") ??
          undefined,

        height:
          fd.get("artist_height") ??
          undefined,

        bust:
          fd.get("artist_bust") ??
          undefined,

        waist:
          fd.get("artist_waist") ??
          undefined,

        hips:
          fd.get("artist_hips") ??
          undefined,

        experience:
          fd.get(
            "artist_experience"
          ) ?? undefined,

        biography:
          fd.get(
            "artist_biography"
          ) ?? undefined,

        picture:
          fd.get("artist_picture") ??
          undefined,
      },

      cover_message:
        fd.get("cover_message") ?? "",

      promo_url:
        fd.get("promo_url") ??
        undefined,

      images:
        fd.get("images") ?? undefined,
    };

    const {
      job_id,
      artist,
      cover_message,
      promo_url,
      images,
    } = schema.parse(body);

    // -------------------------
    // 2. Load job
    // -------------------------

    const [rows] = (await db.query(
      `
      SELECT
        id,
        title,
        apply_email,
        company_name
      FROM jobs
      WHERE id = ?
        AND is_active = 1
      LIMIT 1
      `,
      [job_id]
    )) as [JobRow[], unknown];

    if (!rows.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Job not found or inactive",
        },
        {
          status: 404,
        }
      );
    }

    const job = rows[0];

    // -------------------------
    // 3. Prepare application data
    // -------------------------

    const token =
      createStatusToken();

    const origin =
      req.nextUrl.origin;

    const promoFinal =
      promo_url?.startsWith("/")
        ? `${origin}${promo_url}`
        : promo_url;

    // -------------------------
    // 4. Insert application
    // -------------------------

    const [insertResult]: any =
      await db.execute(
        `
        INSERT INTO applications (
          job_id,

          artist_name,
          artist_email,
          artist_phone,
          artist_instagram,
          artist_country,
          artist_date_of_birth,

          artist_height,
          artist_weight,
          artist_bust,
          artist_waist,
          artist_hips,

          artist_experience,
          artist_biography,
          artist_picture,

          promo_url,
          cover_message,

          application_title,

          status,

          sent_email_status,
          sent_email_error,

          status_token,
          status_token_expires_at,

          created_at,
          updated_at
        )
        VALUES (
          ?,

          ?, ?, ?, ?, ?, ?,

          ?, ?, ?, ?, ?,

          ?, ?, ?,

          ?, ?,

          ?,

          'pending',

          'pending',
          NULL,

          ?,
          DATE_ADD(
            NOW(),
            INTERVAL 14 DAY
          ),

          NOW(),
          NOW()
        )
        `,
        [
          job_id,

          artist.full_name,
          artist.email,
          nullableString(
            artist.phone
          ),
          nullableString(
            artist.instagram
          ),
          nullableString(
            artist.country
          ),
          nullableString(
            artist.date_of_birth
          ),

          nullableString(
            artist.height
          ),
          nullableString(
            artist.weight
          ),
          nullableString(
            artist.bust
          ),
          nullableString(
            artist.waist
          ),
          nullableString(
            artist.hips
          ),

          nullableString(
            artist.experience
          ),
          nullableString(
            artist.biography
          ),

          artist.picture ?? null,

          promoFinal ?? null,

          cover_message?.trim()
            ? cover_message.trim()
            : null,

          job.title,

          token,
        ]
      );

    applicationId =
      insertResult.insertId as number;

    const applicationCode =
      toApplicationCode(
        applicationId
      );

    // -------------------------
    // 5. Save application code
    // -------------------------

    await db.execute(
      `
      UPDATE applications
      SET application_code = ?
      WHERE id = ?
      `,
      [
        applicationCode,
        applicationId,
      ]
    );

    // -------------------------
    // 6. Decision URLs
    // -------------------------

    const base =
      process.env.APP_URL ||
      origin;

    const approveUrl =
      `${base}/decision` +
      `?action=approved` +
      `&token=${token}`;

    const rejectUrl =
      `${base}/decision` +
      `?action=rejected` +
      `&token=${token}`;

    // -------------------------
    // 7. Build PDF
    // -------------------------

    const pdfBuffer =
      await buildArtistProfilePdf({
        jobTitle: job.title,

        companyName:
          job.company_name ?? null,

        artist: {
          full_name:
            artist.full_name,

          country:
            artist.country,

          date_of_birth:
            artist.date_of_birth,

          height:
            artist.height,

          weight:
            artist.weight,

          bust:
            artist.bust,

          waist:
            artist.waist,

          hips:
            artist.hips,

          experience:
            artist.experience,

          biography:
            artist.biography,

          picture:
            artist.picture,
        },

        cover_message,

        promo_url:
          promoFinal,
      });

    // -------------------------
    // 8. Build image attachments
    // -------------------------

    const safeName =
      artist.full_name
        .replace(/\s+/g, "_")
        .replace(
          /[^\w\-]/g,
          ""
        );

    const imgList =
      (images ?? []).slice(
        0,
        5
      );

    const photoAttachments:
      MailAttachment[] =
      await Promise.all(
        imgList.map(
          (
            img,
            index
          ) =>
            fetchAsAttachment(
              img.secure_url,

              `${
                safeName ||
                "Artist"
              }_photo_${
                index + 1
              }`
            )
        )
      );

    const pdfFilename =
      `${
        safeName || "Artist"
      }_Castpoint_Profile.pdf`;

    // -------------------------
    // 9. Send employer email
    // -------------------------

    if (job.apply_email) {
      try {
        await sendEmployerEmail({
          to:
            job.apply_email,

          job,

          artist_public: {
            full_name:
              artist.full_name,
          },

          artist_promo_url:
            promoFinal,

          cover_message,

          urls: {
            approveUrl,
            rejectUrl,
          },

          pdf: {
            filename:
              pdfFilename,

            content:
              pdfBuffer,
          },

          attachments:
            photoAttachments,
        });

        // ---------------------
        // Email sent
        // ---------------------

        await db.execute(
          `
          UPDATE applications
          SET
            sent_email_status = 'sent',
            sent_email_error = NULL
          WHERE id = ?
          `,
          [
            applicationId,
          ]
        );
      } catch (
        emailError
      ) {
        console.error(
          "[apply.email.error]",
          emailError
        );

        await db.execute(
          `
          UPDATE applications
          SET
            sent_email_status = 'failed',
            sent_email_error = ?
          WHERE id = ?
          `,
          [
            emailError instanceof Error
              ? emailError.message
              : "Unknown email error",

            applicationId,
          ]
        );
      }
    } else {
      await db.execute(
        `
        UPDATE applications
        SET
          sent_email_status = 'failed',
          sent_email_error = ?
        WHERE id = ?
        `,
        [
          "Job has no apply_email",
          applicationId,
        ]
      );
    }

    // -------------------------
    // 10. Telegram notification
    // -------------------------

    const captions = [
      "🎭 <b>New Artist Application</b>",
      "",
      `<b>Name:</b> ${artist.full_name}`,
      `<b>Email:</b> ${artist.email}`,
      `<b>Phone:</b> ${
        artist.phone || "—"
      }`,
      `<b>Country:</b> ${
        artist.country || "—"
      }`,
      "",
      `<b>Code:</b> ${applicationCode}`,
      `<b>Job:</b> ${job.title}`,
    ].join("\n");

    await sendToTelegram(
      captions
    );

    // -------------------------
    // 11. Success
    // -------------------------

    return NextResponse.json(
      {
        ok: true,

        application: {
          id:
            applicationId,

          code:
            applicationCode,

          status:
            "pending",
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // -------------------------
    // Validation
    // -------------------------

    if (
      error instanceof ZodError
    ) {
      console.error(
        "[apply.validation]",
        error.issues
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Validation error",

          issues:
            error.issues,
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------
    // Unexpected error
    // -------------------------

    console.error(
      "[apply.error]",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Failed to submit application",
      },
      {
        status: 500,
      }
    );
  }
};