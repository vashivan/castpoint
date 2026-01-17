// lib/mailer.ts
import nodemailer from "nodemailer";

export async function sendEmployerEmail(params: {
  to: string;
  job: { id: number; title: string; company_name?: string | null };
  artist_public: { full_name: string };
  artist_promo_url?: string;
  photos?: File[];
  cover_message?: string;
  pdf: { filename: string; content: Buffer };
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const { to, job, artist_public, artist_promo_url, pdf } = params;

  const subject = `CASTPOINT · Application — ${job.title}`;

  const safe = (v: any) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const html = `
  <div style="margin:0;padding:0;background:#f6f7fb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="640" style="max-width:640px;width:100%;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.07);">
          <tr><td>
            <div style="background:linear-gradient(90deg,#F5720D 0%,#AA0254 100%);padding:18px 22px;color:#fff;font-family:Arial,sans-serif;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">
              CASTPOINT
            </div>
          </td></tr>

          <tr><td style="padding:18px 22px;font-family:Arial,sans-serif;color:#111827;">
            <h2 style="margin:0 0 6px 0;">New Application</h2>
            <p style="margin:0;color:#6b7280;font-size:13px;">
              Job: <b style="color:#111827;">${safe(job.title)}</b>
              ${job.company_name ? ` · ${safe(job.company_name)}` : ""}
            </p>

            <div style="margin-top:14px;border:1px solid rgba(17,24,39,0.08);border-radius:18px;padding:14px;background:#ffffff;">
              <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;font-weight:700;margin-bottom:10px;">
                Candidate:
              </div>
              <div style="font-size:16px;font-weight:800;color:#111827;">
                ${safe(artist_public.full_name)}
              </div>
              <div style="font-size:14px;font-weight:600;color:#111827;">
                ${safe(params.cover_message ?? "")}
              </div>
              <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;font-weight:700;margin-bottom:10px;">
                Promo URL:
              </div>
              <div style="font-size:16px;font-weight:800;color:#111827;">
                ${safe(artist_promo_url ?? "")}
              </div>
              <p style="margin:10px 0 0 0;font-size:12px;color:#6b7280;line-height:1.5;">
                Candidate contact details are managed by Castpoint.  
                If you want to proceed, reply to this email — our manager will connect you with the artist.
              </p>
            </div>

            <div style="margin-top:14px;border:1px dashed rgba(17,24,39,0.18);border-radius:18px;padding:14px;background:#fbfbfd;">
              <b>Attached:</b> Castpoint Artist Profile (PDF)
              <br/>
              <b>Attached:</b> Photos: (${params.photos ? params.photos.length : 0})
            </div>
          </td></tr>

          <tr><td style="padding:14px 22px 22px 22px;font-family:Arial,sans-serif;">
            <div style="height:1px;background:rgba(17,24,39,0.08);"></div>
            <p style="margin:12px 0 0 0;font-size:12px;color:#6b7280;line-height:1.5;">
              Sent via Castpoint — platform from artists for artists.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    attachments: [
      {
        filename: pdf.filename,
        content: pdf.content,
        contentType: "application/pdf",
      },
      {
        // add photos as attachments if any
        filename: `${artist_public.full_name}_1.jpg`,
        content: params.photos && params.photos[0] ? Buffer.from(await params.photos[0].arrayBuffer()) : undefined,
        contentType: "image/jpeg",
      },
      {
        // add second photo if any
        filename: `${artist_public.full_name}_2.jpg`,
        content: params.photos && params.photos[1] ? Buffer.from(await params.photos[1].arrayBuffer()) : undefined,
        contentType: "image/jpeg",
      },
      {
        // add third photo if any
        filename: `${artist_public.full_name}_3.jpg`,
        content: params.photos && params.photos[2] ? Buffer.from(await params.photos[2].arrayBuffer()) : undefined,
        contentType: "image/jpeg",
      },
      {
        // add fourth photo if any
        filename: `${artist_public.full_name}_4.jpg`,
        content: params.photos && params.photos[3] ? Buffer.from(await params.photos[3].arrayBuffer()) : undefined,
        contentType: "image/jpeg",
      },
      {
        // add fifth photo if any
        filename: `${artist_public.full_name}_5.jpg`,
        content: params.photos && params.photos[4] ? Buffer.from(await params.photos[4].arrayBuffer()) : undefined,
        contentType: "image/jpeg",
      }
    ],
  });
}
