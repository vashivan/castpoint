import nodemailer from 'nodemailer';

const {
  EMAIL_HOST,
  EMAIL_PORT = '465',
  EMAIL_SECURE = 'true',
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,                           // smtp.hostinger.com або smtp.titan.email
  port: Number(EMAIL_PORT),                   // 465 або 587
  secure: EMAIL_SECURE === 'true',            // true для 465 (SSL), false для 587 (STARTTLS)
  auth: {
    user: EMAIL_USER as string,
    pass: EMAIL_PASS as string,
  },
  // Можна увімкнути тимчасово для діагностики:
  // logger: true,
  // debug: true,
});

export async function subscribeEmail(to: string,) {
  await transporter.sendMail({
  from: EMAIL_USER,
  to,
  subject: "Welcome to Castpoint — thanks for subscribing",
  text: `Hi there!

Thanks for subscribing to Castpoint — a platform by artists, for artists. 
From now on, you’ll receive fresh job opportunities abroad, real workplace reviews, and useful tips to grow your career. 

Stay tuned — your next opportunity might be just one email away.

— Castpoint Team`,
  html: `
    <div style="font-family:Inter, Arial, sans-serif; background:#0b0b0c; color:#eaeaea; padding:24px; border-radius:12px;">
      <h2 style="margin:0 0 12px 0; color:#fff;">Welcome to Castpoint!</h2>
      <p style="margin:0 0 10px 0; font-size:15px; line-height:1.5;">
        Thanks for subscribing — we’re happy to have you here.
      </p>
      <p style="margin:0 0 10px 0; font-size:15px; line-height:1.5;">
        As part of Castpoint, you’ll get:
        <br>• Fresh international job offers for artists
        <br>• Honest reviews from colleagues
        <br>• Practical tips for contracts, travel, and career
      </p>
      <p style="margin:0 0 16px 0; font-size:15px; line-height:1.5;">
        Stay tuned — your next opportunity might be just one email away.
      </p>
      <p style="margin:0; font-size:14px; color:#aaa;">
        — Castpoint Team
      </p>
    </div>
  `
});
}
