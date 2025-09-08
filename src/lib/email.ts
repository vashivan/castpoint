import nodemailer from 'nodemailer';

const {
  EMAIL_HOST,
  EMAIL_PORT = '465',
  EMAIL_SECURE = 'true',
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
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

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: EMAIL_FROM || EMAIL_USER,           // домен from має збігатися з доменом пошти
    to,
    subject: 'Reset your Castpoint password',
    html: `
      <p>Hello!</p>
      <p>We received a request to reset your Castpoint password.</p>
      <p><a href="${resetUrl}" target="_blank"
            style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:8px;text-decoration:none;">
            Reset password</a></p>
      <p>Or open this link: <a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      <p>This link will expire in 1 hour. If you didn’t request this, just ignore this email.</p>
    `,
    // за потреби:
    // replyTo: 'support@your-domain.com',
  });
}
