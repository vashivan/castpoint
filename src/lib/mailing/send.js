import fs from "fs";
import nodemailer from "nodemailer";
import "dotenv/config";
import { parse } from "csv-parse/sync";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function renderTemplate(html, vars) {
  let out = html;
  for (const [k, v] of Object.entries(vars)) {
    const safe = String(v ?? "");
    out = out.replaceAll(`{{${k}}}`, safe);
  }
  return out;
}

async function main() {
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
    SUBJECT,
    REVIEW_URL,
    DASHBOARD_URL,
    BATCH_SIZE,
    DELAY_MS,
  } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Missing SMTP env vars. Check your .env file.");
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT || 465),
    secure: String(EMAIL_SECURE || "true") === "true", // 465 => true
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  // Optional: verify SMTP connection
  await transporter.verify();

  const htmlBase = fs.readFileSync(
  path.join(__dirname, "email.html"),
  "utf8"
);

const csv = fs.readFileSync(
  path.join(__dirname, "profiles.csv"),
  "utf8"
);
  const rows = parse(csv, { columns: true, skip_empty_lines: true });

  const recipients = rows
    .map((r) => ({
      email: String(r.email || "").trim(),
      // name: String(r.name || "").trim(),
    }))
    .filter((r) => r.email.includes("@"));

  if (recipients.length === 0) {
    console.log("No recipients found in recipients.csv");
    return;
  }

  const batchSize = Number(BATCH_SIZE || 20);
  const delayMs = Number(DELAY_MS || 1200);

  console.log(`Recipients: ${recipients.length}`);
  console.log(`Batch size: ${batchSize}, delay: ${delayMs}ms`);

  const batches = chunk(recipients, batchSize);

  // Log results to a file (so you can re-check who failed)
  const logStream = fs.createWriteStream("./send-log.txt", { flags: "a" });

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    console.log(`\nBatch ${b + 1}/${batches.length} (${batch.length} emails)`);

    for (const r of batch) {
      const name = r.name || "there";

      const html = renderTemplate(htmlBase, {
        name,
        review_url: REVIEW_URL || "https://castpoint.com",
        dashboard_url: DASHBOARD_URL || "https://castpoint.com",
      });

      try {
        await transporter.sendMail({
          from: `"${EMAIL_USER || "Castpoint"}" <${EMAIL_USER}>`,
          to: r.email,
          subject: SUBJECT || "Castpoint update",
          html,
          // Good practice: a plain-text fallback
          text: `Hi ${name},\n\nPlease share your experience on Castpoint and help the community.\nLeave a review: ${REVIEW_URL}\nYour dashboard: ${DASHBOARD_URL}\n\n— Castpoint Team`,
          // Optional headers
          headers: {
            "X-Entity-Ref-ID": "castpoint-community-email",
          },
        });

        console.log(`✅ Sent to ${r.email}`);
        logStream.write(`OK,${r.email}\n`);
      } catch (err) {
        console.log(`❌ Failed ${r.email}`, err?.message || err);
        logStream.write(`FAIL,${r.email},${JSON.stringify(err?.message || err)}\n`);
      }

      await sleep(delayMs);
    }
  }

  logStream.end();
  console.log("\nDone. See send-log.txt for results.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
