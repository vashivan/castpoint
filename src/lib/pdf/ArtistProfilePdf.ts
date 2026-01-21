import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PDFDocument, rgb, PDFFont, PDFPage } from "pdf-lib";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const fontkit = require("fontkit");

/* ---------- BRAND + LAYOUT ---------- */

const BRAND = {
  bg: rgb(0xff / 255, 0xf7 / 255, 0xfb / 255), // light pink
  primary: rgb(0x11 / 255, 0x18 / 255, 0x27 / 255), // #111827
  accent: rgb(0xec / 255, 0x4a / 255, 0x93 / 255), // pink-magenta
  muted: rgb(0x6b / 255, 0x72 / 255, 0x80 / 255),
  white: rgb(1, 1, 1),
};

const A4: [number, number] = [595.28, 841.89];
const MARGIN = { top: 60, bottom: 50, left: 48, right: 48 };

const BODY = 10;
const H1 = 22;
const H2 = 12;
const LINE_H = (size: number) => size * 1.35;

type TableRow = [string, string];

/* ---------- SAFE + FORMAT HELPERS ---------- */

function safeStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

function safeText(v: unknown): string {
  const s = safeStr(v).trim();
  return s ? s : "—";
}

// 172.00 -> 172, 58.0 -> 58, "" -> "—"
function fmtIntLike(v: unknown): string {
  const s = safeStr(v).trim();
  if (!s) return "—";
  const n = Number(s.replace(",", "."));
  if (Number.isFinite(n)) return String(Math.round(n));
  return s || "—";
}

function normalizeDateToYMD(dateStr: unknown): string {
  const s = safeStr(dateStr).trim();
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s; // keep original if it's not a valid date
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------- IO HELPERS ---------- */

async function readPublic(relPath: string): Promise<Uint8Array> {
  const abs = path.join(process.cwd(), "public", relPath);
  return await fs.promises.readFile(abs);
}

function isHttpUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

async function loadImageBytes(src: string): Promise<Uint8Array | null> {
  const s = (src || "").trim();
  if (!s) return null;

  try {
    if (isHttpUrl(s)) {
      const res = await fetch(s);
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      return new Uint8Array(ab);
    }

    const rel = s.startsWith("/") ? s.slice(1) : s;
    const bytes = await readPublic(rel);
    return new Uint8Array(bytes);
  } catch {
    return null;
  }
}

async function normalizeToJpeg(bytes: Uint8Array): Promise<Uint8Array | null> {
  try {
    const fixed = await sharp(bytes).rotate().jpeg({ quality: 88 }).toBuffer();
    return fixed?.length ? new Uint8Array(fixed) : null;
  } catch {
    return null;
  }
}

/* ---------- WRAP + TABLE ---------- */

function wrapText(text: string, maxWidth: number, font: any, fontSize: number) {
  const t = (text || "—").replace(/\s+/g, " ").trim();
  const words = t ? t.split(" ") : ["—"];
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
  return lines.length ? lines : ["—"];
}

function drawTwoColTable(opts: {
  page: PDFPage;
  x: number;
  y: number; // top y
  w: number;
  leftRatio: number;
  rows: TableRow[];
  font: PDFFont;
  fontSize: number;
  rowPad: number;
}) {
  const { page, x, y, w, leftRatio, rows, font, fontSize, rowPad } = opts;
  const leftW = w * leftRatio;
  const rightW = w - leftW;
  let cy = y;

  for (const [k, v] of rows) {
    const kLines = wrapText(k || "—", leftW, font, fontSize);
    const vLines = wrapText(v || "—", rightW, font, fontSize);
    const lines = Math.max(kLines.length, vLines.length);
    const rowH = lines * LINE_H(fontSize) + rowPad * 2;

    // left label
    for (let li = 0; li < kLines.length; li++) {
      page.drawText(kLines[li], {
        x,
        y: cy + rowH - rowPad - (li + 1) * LINE_H(fontSize),
        size: fontSize,
        font,
        color: BRAND.muted,
      });
    }

    // right value
    for (let li = 0; li < vLines.length; li++) {
      page.drawText(vLines[li], {
        x: x + leftW + 8,
        y: cy + rowH - rowPad - (li + 1) * LINE_H(fontSize),
        size: fontSize,
        font,
        color: BRAND.primary,
      });
    }

    cy += rowH;
  }

  return cy; // lower y
}

/* ---------- JUSTIFY HELPERS ---------- */

function wrapWords(text: string) {
  return (text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function wrapLinesByWidth(words: string[], maxWidth: number, font: any, fontSize: number) {
  const lines: string[][] = [];
  let line: string[] = [];

  for (const w of words) {
    const test = line.length ? [...line, w].join(" ") : w;
    const width = font.widthOfTextAtSize(test, fontSize);

    if (width <= maxWidth) line.push(w);
    else {
      if (line.length) lines.push(line);
      line = [w];
    }
  }

  if (line.length) lines.push(line);
  return lines.length ? lines : [["—"]];
}

function drawJustifiedParagraph(opts: {
  page: PDFPage;
  text: string;
  x: number;
  y: number; // baseline y
  width: number;
  font: PDFFont;
  fontSize: number;
  lineHeight?: number;
  color?: any;
}) {
  const {
    page,
    text,
    x,
    y,
    width,
    font,
    fontSize,
    lineHeight = fontSize * 1.35,
    color = BRAND.primary,
  } = opts;

  const t = (text || "").trim();
  const words = wrapWords(t || "—");
  const lines = wrapLinesByWidth(words, width, font, fontSize);

  let cy = y;

  for (let i = 0; i < lines.length; i++) {
    const lineWords = lines[i];
    const isLastLine = i === lines.length - 1;

    // last line or single word -> normal
    if (isLastLine || lineWords.length === 1) {
      page.drawText(lineWords.join(" "), { x, y: cy, size: fontSize, font, color });
      cy -= lineHeight;
      continue;
    }

    // justify
    const wordsWidth = lineWords.reduce(
      (acc: number, w: string) => acc + font.widthOfTextAtSize(w, fontSize),
      0
    );

    const gaps = lineWords.length - 1;
    const extra = width - wordsWidth;
    const gapSize = extra / gaps;

    let cx = x;
    for (let wi = 0; wi < lineWords.length; wi++) {
      const w = lineWords[wi];
      page.drawText(w, { x: cx, y: cy, size: fontSize, font, color });
      cx += font.widthOfTextAtSize(w, fontSize);
      if (wi < lineWords.length - 1) cx += gapSize;
    }

    cy -= lineHeight;
  }

  return cy;
}

/* ---------- EXPORT ---------- */

export async function buildArtistProfilePdf(opts: {
  jobTitle: string;
  companyName?: string | null;
  artist: {
    full_name: string;
    position?: string | null;

    country?: string | null;
    date_of_birth?: string;

    height?: string | number | null;
    weight?: string | number | null;

    bust?: string | number | null;
    waist?: string | number | null;
    hips?: string | number | null;

    experience?: string | null;
    education?: string | null;
    additional?: string | null;

    biography?: string | null;
    picture?: string | null;
  };

  cover_message?: string;
  promo_url?: string;
  photos?: File[];
}) {
  const { jobTitle, artist, cover_message } = opts;

  // Fonts
  // Keep your fonts; change if needed
  const fontRegularBytes = await readPublic("fonts/montserrat-latin-400-italic.ttf");
  const fontBoldBytes = await readPublic("fonts/Montserrat-Bold.ttf");

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);

  const page = pdfDoc.addPage(A4);
  const { width, height } = page.getSize();

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: BRAND.bg });

  /* ---------- HEADER ---------- */
  let cursorY = height - MARGIN.top;

  page.drawText("Artist Application", {
    x: MARGIN.left,
    y: cursorY,
    size: H1,
    font: fontBold,
    color: BRAND.primary,
  });

  cursorY -= H1 + 4;

  // Band text
  const bandX = MARGIN.left;
  const bandH = 30;
  const bandY = cursorY - bandH;

  const bandText = [safeText(jobTitle), safeText(artist.full_name)].filter(Boolean).join("   •   ");

  page.drawText(bandText, {
    x: bandX,
    y: bandY + 10,
    size: BODY,
    font: fontBold,
    color: BRAND.primary,
  });

  /* ---------- MAIN COLUMNS ---------- */
  const colGap = 24;
  const leftW = (width - MARGIN.left - MARGIN.right - colGap) * 0.60;
  const rightW = (width - MARGIN.left - MARGIN.right - colGap) * 0.40;
  const leftX = MARGIN.left;
  const rightX = leftX + leftW + colGap;

  let cursorLeftY = bandY - 28;
  let cursorRightY = bandY - 28;

  // LEFT title
  page.drawText("Contact & Basics", {
    x: leftX,
    y: cursorLeftY,
    size: H2,
    font: fontBold,
    color: BRAND.accent,
  });

  // IMPORTANT: don't use huge magic numbers; keep it tight
  cursorLeftY -= H2 + 185;

  const rows: TableRow[] = [
    ["Nationality:", safeText(artist.country)],
    ["Date of Birth:", safeText(normalizeDateToYMD(artist.date_of_birth))],

    ["Height (cm):", fmtIntLike(artist.height)],
    ["Weight (kg):", fmtIntLike(artist.weight)],

    ["Bust (cm):", fmtIntLike(artist.bust)],
    ["Waist (cm):", fmtIntLike(artist.waist)],
    ["Hips (cm):", fmtIntLike(artist.hips)],
  ];

  cursorLeftY = drawTwoColTable({
    page,
    x: leftX,
    y: cursorLeftY,
    w: leftW,
    leftRatio: 0.32,
    rows,
    font: fontRegular,
    fontSize: BODY,
    rowPad: 6,
  });

  // RIGHT: Photo
  page.drawText("Photo", {
    x: rightX,
    y: cursorRightY,
    size: H2,
    font: fontBold,
    color: BRAND.accent,
  });

  cursorRightY -= H2 + 8;

  const photoW = rightW;
  const photoH = 240;

  const rawProfileBytes = artist.picture ? await loadImageBytes(String(artist.picture)) : null;
  const profileBytes = rawProfileBytes ? (await normalizeToJpeg(rawProfileBytes)) ?? rawProfileBytes : null;

  if (profileBytes?.length) {
    const img = await pdfDoc.embedJpg(profileBytes);
    const ratio = Math.min(photoW / img.width, photoH / img.height);
    const iw = img.width * ratio;
    const ih = img.height * ratio;

    // center-ish inside right column
    const ix = rightX + (photoW - iw) / 2;
    const iy = cursorRightY - ih;

    page.drawImage(img, { x: ix, y: iy, width: iw, height: ih });
    cursorRightY -= photoH + 12;
  } else {
    page.drawText("No photo attached", {
      x: rightX,
      y: cursorRightY - 14,
      size: 9,
      font: fontRegular,
      color: BRAND.muted,
    });
    cursorRightY -= photoH+12;
  }

  /* ---------- BOTTOM STACK (FULL WIDTH) ---------- */
  let stackY = Math.min(cursorLeftY, cursorRightY) - 32;
  if (stackY < 160) stackY = 160;

  const fullW = width - MARGIN.left - MARGIN.right;

  const drawTextBlockJustified = (opts2: { title: string; text: string; fontSize?: number }) => {
    const { title, text, fontSize = BODY } = opts2;

    // title
    page.drawText(title, {
      x: MARGIN.left,
      y: stackY,
      size: H2,
      font: fontBold,
      color: BRAND.accent,
    });

    stackY -= H2 + 6;

    // keep paragraph breaks
    const raw = (text || "—").trim() || "—";
    const paragraphs = raw.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);

    for (let pi = 0; pi < paragraphs.length; pi++) {
      stackY = drawJustifiedParagraph({
        page,
        text: paragraphs[pi],
        x: MARGIN.left,
        y: stackY,
        width: fullW,
        font: fontRegular,
        fontSize,
        lineHeight: LINE_H(fontSize),
        color: BRAND.primary,
      });

      if (pi < paragraphs.length - 1) stackY -= 8;
    }

    stackY -= 22;
  };

  // Experience (justified)
  drawTextBlockJustified({
    title: "Experience",
    text: safeStr(artist.experience) || "—",
    fontSize: BODY,
  });

  // Education (justified)
  drawTextBlockJustified({
    title: "Education",
    text: safeStr(artist.education) || "—",
    fontSize: 9,
  });

  // Additional (justified)
  drawTextBlockJustified({
    title: "Additional",
    text: safeStr(artist.additional) || safeStr(artist.biography) || "—",
    fontSize: 9,
  });

  // Message (justified)
  if (cover_message && cover_message.trim()) {
    drawTextBlockJustified({
      title: "Message",
      text: cover_message.trim(),
      fontSize: 9,
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
