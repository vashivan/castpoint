// src/lib/mailer.ts
import nodemailer from 'nodemailer';
import { Job } from '../utils/Types';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST!,
  port: Number(process.env.EMAIL_PORT || 465),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: { user: process.env.EMAIL_USER!, pass: process.env.EMAIL_PASS! },
});

type SendEmployerEmailArgs = {
  to: string;
  job: Pick<Job, 'title'> & { company_name?: string }; // достатньо для теми/прехедера
  artist: {
    full_name: string;
    email: string;
    phone?: string;
    instagram?: string;
    profile_url?: string;
    city?: string;
    country?: string;
    date_of_birth?: string;  // YYYY-MM-DD бажано
    weight?: string;         // наприклад, "58 kg"
    height?: string;         // наприклад, "172 cm"
    experience?: string;     // коротко "3 роки сцени…"
    biography?: string;      // довільний текст
    picture?: string;        // url на фото
  };
  cover_message: string;
  cv_url?: string;
  promo_url?: string;     // ЗВОРОТНЯ СУМІСНІСТЬ (буде використане як portfolio_url)
};

// ——— helpers ———
const esc = (s?: string) =>
  (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const normalizeUrl = (u?: string) => {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  // mailto/instagram shorthand
  if (u.startsWith('mailto:')) return u;
  return `https://${u}`;
};


export async function sendEmployerEmail(args: SendEmployerEmailArgs) {
  const { to, job, artist, cover_message, promo_url, cv_url } = args;
  
  const formatDatePretty = (val?: string) => {
    if (!val) return '';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const ctaUrl = process.env.EMPLOYERS_LANDING_URL || 'https://castpoint.art/employers';
  const preheader = `New application for ${job.title} – ${artist.full_name}`;

  const cvUrl = normalizeUrl(cv_url);
  const pictureUrl = normalizeUrl(artist.picture);
  const date = formatDatePretty(artist.date_of_birth);

  // блок із додатковими полями — показуємо лише якщо вони є
  const profileExtraRows = [
    artist.date_of_birth
      ? `<tr><td style="padding:4px 0"><b>Date of birth:</b></td><td style="padding:4px 8px">${esc(
        date
      )}</td></tr>`
      : '',
    artist.height
      ? `<tr><td style="padding:4px 0"><b>Height:</b></td><td style="padding:4px 8px">${esc(artist.height)}</td></tr>`
      : '',
    artist.weight
      ? `<tr><td style="padding:4px 0"><b>Weight:</b></td><td style="padding:4px 8px">${esc(artist.weight)}</td></tr>`
      : '',
    artist.experience
      ? `<tr><td style="padding:4px 0"><b>Experience:</b></td><td style="padding:4px 8px">${esc(
        artist.experience
      )}</td></tr>`
      : '',
  ]
    .filter(Boolean)
    .join('');

  const biographyBlock = artist.biography
    ? `
    <div style="margin:12px 0;padding:12px;border:1px solid #eee;border-radius:8px">
      <div style="font-weight:600;margin-bottom:6px">Biography</div>
      <p style="margin:0;white-space:pre-wrap">${esc(artist.biography)}</p>
    </div>`
    : '';

  const pictureBlock = pictureUrl
    ? `
    <div style="margin:12px 0">
      <div style="font-weight:600;margin-bottom:6px">Photo</div>
      <img src="${pictureUrl}" alt="Candidate photo" style="max-width:100%;border-radius:10px;border:1px solid #eee" />
    </div>`
    : '';

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111;background:#f6f6f8;padding:24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:20px 24px;background:#111;color:#fff">
        <h2 style="margin:0;font-size:18px;">Castpoint — New Application</h2>
        <p style="margin:6px 0 0;font-size:12px;opacity:.85">${esc(preheader)}</p>
      </td></tr>

      <tr><td style="padding:20px 24px">
        <h3 style="margin:0 0 8px">${esc(artist.full_name)}</h3>
        <p style="margin:0 0 12px;font-size:14px;opacity:.8">${esc(artist.city || '')}${artist.country || ''
    }</p>

        <div style="margin:12px 0;padding:12px;border:1px solid #eee;border-radius:8px">
          <div style="font-weight:600;margin-bottom:6px">Message</div>
          <p style="margin:0;white-space:pre-wrap">${esc(cover_message)}</p>
        </div>

        ${biographyBlock || pictureBlock
      ? `<div>${biographyBlock}${pictureBlock}</div>`
      : ''
    }

        <table style="font-size:14px;margin:12px 0" cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 0"><b>Email:</b></td><td style="padding:4px 8px"><a href="mailto:${esc(
      artist.email
    )}">${esc(artist.email)}</a></td></tr>
          ${artist.phone
      ? `<tr><td style="padding:4px 0"><b>Phone:</b></td><td style="padding:4px 8px">${esc(
        artist.phone
      )}</td></tr>`
      : ''
    }
          ${artist.instagram
      ? `<tr><td style="padding:4px 0"><b>Instagram:</b></td><td style="padding:4px 8px"><a style="color:black" href="${`https://www.instagram.com/${artist.instagram}`}">link here</a></td></tr>`
      : ''
    }
          ${cv_url ? `<tr><td style="padding:4px 0"><b>CV:</b></td><td style="padding:4px 8px"><a href="${cvUrl}">link here</a></td></tr>` : ''}
          ${promo_url
      ? `<tr><td style="padding:4px 0"><b>Promo:</b></td><td style="padding:4px 8px"><a style="color:black" href="${promo_url}">link here</a></td></tr>`
      : ''
    }
          ${profileExtraRows}
        </table>

        <div style="margin:20px 0 4px">
          <a href="${ctaUrl}" target="_blank"
             style="display:inline-block;padding:12px 16px;background:#111;color:#fff;border-radius:10px;text-decoration:none">
             Join Employer Waitlist
          </a>
        </div>
        <p style="margin:6px 0 0;font-size:12px;opacity:.7">
          Get early access to Castpoint for Employers: manage jobs, shortlist artists, messaging & more.
        </p>
      </td></tr>

      <tr><td style="padding:16px 24px;background:#fafafa;color:#666;font-size:12px">
        <p style="margin:0">You received this because a candidate applied to your job "${esc(job.title)}".</p>
        <p style="margin:4px 0 0">Castpoint · Find your contract</p>
      </td></tr>
    </table>
  </div>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `New application for ${job.title} — ${artist.full_name}`,
    html,
    // (опційно) plain text fallback:
    text:
      `New application for ${job.title}\n\n` +
      `${artist.full_name} ${artist.city || ''} ${artist.country || ''}\n` +
      `Email: ${artist.email}${artist.phone ? `\nPhone: ${artist.phone}` : ''}\n` +
      `${artist.instagram ? `Instagram: ${artist.instagram}\n` : ''}` +
      `${artist.profile_url ? `Profile: ${artist.profile_url}\n` : ''}` +
      `${cv_url ? `CV: ${cv_url}\n` : ''}` +
      `${promo_url ? `Promo: ${promo_url}\n` : ''}` +
      `${date ? `DOB: ${date}\n` : ''}` +
      `${artist.height ? `Height: ${artist.height}\n` : ''}` +
      `${artist.weight ? `Weight: ${artist.weight}\n` : ''}` +
      `${artist.experience ? `Experience: ${artist.experience}\n` : ''}\n\n` +
      `Message:\n${cover_message}\n\n` +
      `Join Employer Waitlist: ${ctaUrl}`
  });
}
