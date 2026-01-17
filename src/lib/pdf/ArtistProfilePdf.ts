import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PDFDocument, rgb } from "pdf-lib";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const fontkit = require("fontkit");


const BRAND = {
  bg: rgb(0xff / 255, 0xf7 / 255, 0xfb / 255),
  primary: rgb(0, 0, 0),
  accent: rgb(0xf5 / 255, 0x72 / 255, 0x0d / 255), // orange
  accent2: rgb(0xaa / 255, 0x02 / 255, 0x54 / 255), // pink
  muted: rgb(0x6b / 255, 0x72 / 255, 0x80 / 255),
  white: rgb(1, 1, 1),
};

const A4: [number, number] = [595.28, 841.89];
const M = { top: 56, bottom: 48, left: 48, right: 48 };
const H1 = 20;
const H2 = 12;
const BODY = 10;
const LH = (s: number) => s * 1.35;

function safe(v: unknown) {
  return (typeof v === "string" ? v : "") || "";
}

async function readPublic(relPath: string): Promise<Uint8Array> {
  const abs = path.join(process.cwd(), "public", relPath);
  return await fs.promises.readFile(abs);
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number) {
  const words = (text || "—").split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, fontSize);
    if (width <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function isHttpUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

async function loadImageBytes(src: string): Promise<Uint8Array | null> {
  const s = (src || "").trim();
  if (!s) return null;

  try {
    // URL (Cloudinary теж ок)
    if (isHttpUrl(s)) {
      const res = await fetch(s);
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      return new Uint8Array(ab);
    }

    // Якщо у тебе в БД зберігається типу "/uploads/avatar.jpg"
    // і воно лежить у /public/uploads/avatar.jpg
    const rel = s.startsWith("/") ? s.slice(1) : s;
    const bytes = await readPublic(rel);
    return new Uint8Array(bytes);
  } catch {
    return null;
  }
}

function normalizeDateString(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

async function normalizeToJpeg(bytes: Uint8Array): Promise<Uint8Array | null> {
  try {
    const fixed = await sharp(bytes).rotate().jpeg({ quality: 88 }).toBuffer();
    return fixed?.length ? new Uint8Array(fixed) : null;
  } catch {
    return null;
  }
}


export async function buildArtistProfilePdf(opts: {
  jobTitle: string;
  companyName?: string | null;
  artist: {
    full_name: string;
    country?: string;
    date_of_birth: string;
    height?: string;
    weight?: string;
    experience?: string;
    biography?: string;
    picture?: string;
  };
  cover_message?: string;
  promo_url?: string;
  photos?: File[]; // up to 5
}) {
  const {
    jobTitle,
    companyName,
    artist,
    cover_message,
  } = opts;

  // Fonts
  const fontRegularBytes = await readPublic("fonts/Montserrat-VariableFont_wght.ttf");
  const fontBoldBytes = await readPublic("fonts/Montserrat-Bold.ttf");

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage(A4);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: 0, width, height, color: BRAND.white });

  const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);

  // Header gradient-ish band (2 rectangles)
  page.drawRectangle({ x: 0, y: height - 92, width, height: 92, color: BRAND.accent });
  page.drawRectangle({ x: width * 0.55, y: height - 92, width: width * 0.45, height: 92, color: BRAND.accent2 });

  page.drawText("CASTPOINT", {
    x: M.left,
    y: height - 54,
    size: 18,
    font: fontBold,
    color: BRAND.white,
  });

  page.drawText("Profile", {
    x: M.left,
    y: height - 74,
    size: 16,
    font: fontBold,
    color: BRAND.white,
  });

  // Title block
  let y = height - 120;

  page.drawText("Application for", { x: M.left, y, size: 10, font: fontBold, color: BRAND.muted });
  y -= 22;

  page.drawText(jobTitle || "—", { x: M.left, y, size: 16, font: fontRegular, color: BRAND.primary });
  y -= 22;

  if (companyName) {
    page.drawText(companyName, { x: M.left, y, size: 10, font: fontRegular, color: BRAND.muted });
    y -= 28;
  }

  // Two columns
  const gap = 18;
  const leftW = (width - M.left - M.right - gap) * 0.58;
  const rightW = (width - M.left - M.right - gap) * 0.42;
  const leftX = M.left;
  const rightX = leftX + leftW + gap;

  let yl = y;
  let yr = y;

  // Left: details
  page.drawText("Profile", { x: leftX, y: yl, size: H2, font: fontBold, color: BRAND.accent2 });
  yl -= 16;

  const rows: Array<[string, string]> = [
    ["Full name", safe(artist.full_name) || "—"],
    ["Country", safe(artist.country) || "—"],
    ["Date of birth", safe(normalizeDateString(artist.date_of_birth)) || "—"],
    ["Height (cm)", safe(artist.height) || "—"],
    ["Weight (kg)", safe(artist.weight) || "—"],
  ];

  const maxW = leftW;
  for (const [k, v] of rows) {
    page.drawText(k, { x: leftX, y: yl, size: 9, font: fontBold, color: BRAND.muted });
    yl -= 16;

    const lines = wrapText(v || "—", maxW, fontBold, 11);
    for (const ln of lines) {
      page.drawText(ln, { x: leftX, y: yl, size: 11, font: fontRegular, color: BRAND.primary });
      yl -= LH(11);
    }
    yl -= 8;
  }

  // Experience
  page.drawText("Experience", { x: leftX, y: yl, size: H2, font: fontBold, color: BRAND.accent2 });
  yl -= 16;

  const expLines = wrapText(safe(artist.experience) || "—", leftW, fontRegular, BODY);
  for (const ln of expLines.slice(0, 18)) {
    page.drawText(ln, { x: leftX, y: yl, size: BODY, font: fontRegular, color: BRAND.primary });
    yl -= LH(BODY);
  }
  yl -= 10;

  if (artist.biography) {
    page.drawText("Biography", { x: leftX, y: yl, size: H2, font: fontBold, color: BRAND.accent2 });
    yl -= 16;
    const expLines = wrapText(safe(artist.biography) || "—", leftW, fontRegular, BODY);
    for (const ln of expLines.slice(0, 18)) {
      page.drawText(ln, { x: leftX, y: yl, size: BODY, font: fontRegular, color: BRAND.primary });
      yl -= LH(BODY + 6);
    }
  }

  // Message
  if (cover_message && cover_message.trim()) {
    page.drawText("Message", { x: leftX, y: yl, size: H2, font: fontBold, color: BRAND.accent2 });
    yl -= 16;
    const msgLines = wrapText(cover_message.trim(), leftW, fontRegular, 9);
    for (const ln of msgLines.slice(0, 22)) {
      page.drawText(ln, { x: leftX, y: yl, size: 9, font: fontRegular, color: BRAND.primary });
      yl -= LH(9);
    }
  }

  // Right: profile photo only
  page.drawText("Photo", { x: rightX, y: yr, size: H2, font: fontBold, color: BRAND.accent2 });
  yr -= 16;

  const boxW = rightW;
  const boxH = 200;

  const rawProfileBytes = artist.picture ? await loadImageBytes(artist.picture) : null;
  const profileBytes = rawProfileBytes ? (await normalizeToJpeg(rawProfileBytes)) ?? rawProfileBytes : null;

  if (profileBytes?.length) {
    const img = await pdfDoc.embedJpg(profileBytes);

    const pad = 10;
    const availW = boxW - pad * 2;
    const availH = boxH - pad * 2;

    const ratio = Math.min(availW / img.width, availH / img.height);
    const iw = img.width * ratio;
    const ih = img.height * ratio;

    const ix = rightX + (boxW - iw) / 2;
    const iy = (yr - boxH) + (boxH - ih) / 2;

    page.drawImage(img, { x: ix, y: iy, width: iw, height: ih });
  } else {
    page.drawText("No profile photo", {
      x: rightX + 12,
      y: yr - 20,
      size: 9,
      font: fontRegular,
      color: BRAND.muted,
    });
  }

  yr -= boxH + 18;

  // Footer
  page.drawText("Generated by CASTPOINT platform", {
    x: M.left,
    y: M.bottom - 18,
    size: 8,
    font: fontRegular,
    color: BRAND.muted,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
