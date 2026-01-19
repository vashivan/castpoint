// lib/mailer.ts
import nodemailer from "nodemailer";
type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export async function sendEmployerEmail(params: {
  to: string;
  job: any;
  artist_public: { full_name: string };
  artist_promo_url?: string;
  cover_message?: string;
  pdf: { filename: string; content: Buffer };
  attachments?: MailAttachment[]; // ✅ додали
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const { to, job, artist_public, artist_promo_url, pdf, attachments } = params;

  const subject = `CASTPOINT · Application — ${job.title}`;
  const from = process.env.EMAIL_USER;

  const safe = (v: any) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const html = `
  <div style="margin:0;padding:0;background:#fff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td align="center">
        <table role="presentation" width="100%" background:#fff;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.07);">
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

            <div style="margin-top:14px;background:#ffffff;">
              <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;font-weight:700;margin-bottom:10px;">
                Candidate:
              </div>
              <div style="font-size:16px;font-weight:800;color:#111827;margin-bottom:6px;">
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

            <div style="margin-top:14px;border:1px dashed rgba(17,24,39,0.18);padding:14px;background:#fbfbfd;">
              <b>Attached:</b> Castpoint Artist Profile (PDF)
              <br/>
              <b>Attached:</b> Photos: (${params.attachments ? params.attachments.length : 0})
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
    from: from,
    to: to,
    subject: subject,
    html,
    attachments: [
      {
        filename: pdf.filename,
        content: params.pdf.content,
        contentType: "application/pdf",
      },
      ...(attachments ?? []).map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    ],
  });
}
