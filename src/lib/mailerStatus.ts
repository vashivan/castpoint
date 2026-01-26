import nodemailer from "nodemailer"

export async function sendArtistStatusEmail(params: {
  to: string;
  jobTitle: string,
  status: string;
  appCode: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465, // важливо!
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const map = {
    approved: {
      title: "Approved ✅",
      text: "Good news — your application was approved. Our team will follow up with next steps soon.",
    },
    rejected: {
      title: "Rejected",
      text: "Your application was reviewed, but it wasn’t selected this time. Don’t worry — you can apply to other jobs anytime.",
    },
  }[params.status];

  const subject = `Castpoint · Application ${map?.title}`;

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;">
      <h2 style="margin:0 0 8px 0;">${params.jobTitle}</h2>
      <h2 style="margin:0 0 8px 0;">${map?.title}</h2>
      <p style="margin:0 0 12px 0;color:#6b7280;">Application code: <b>${params.appCode}</b></p>
      <p style="margin:0;line-height:1.6;">${map?.text}</p>
      <p style="margin:16px 0 0 0;color:#6b7280;font-size:12px;">Sent via Castpoint.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: params.to,
    subject,
    html,
  });
}
