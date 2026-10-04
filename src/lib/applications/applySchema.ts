// Validation for POST /api/apply (multipart form sent by the apply modal).
import { z } from "zod";

/** Images may only come from our Cloudinary account, so the server never fetches arbitrary URLs. */
const CLOUDINARY_HOST = "res.cloudinary.com";

const asOptionalUrlOrPath = z.preprocess((v) => {
  if (v == null || typeof v !== "string") return v ?? undefined;
  const s = v.trim();
  if (!s || s === "null" || s === "undefined") return undefined;
  return s.startsWith("www.") ? `https://${s}` : s;
}, z.union([z.string().url(), z.string().startsWith("/")]).optional());

const uploadedImageSchema = z.object({
  secure_url: z
    .string()
    .url()
    .refine((u) => new URL(u).hostname === CLOUDINARY_HOST, "Images must be uploaded to Cloudinary"),
  public_id: z.string().min(3),
  bytes: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.string().optional(),
});

const optionalText = z.string().optional();

export const applySchema = z.object({
  job_id: z.coerce.number().int().positive(),
  artist: z.object({
    full_name: z.string().min(2),
    date_of_birth: optionalText,
    phone: optionalText,
    instagram: optionalText,
    country: optionalText,
    weight: optionalText,
    height: optionalText,
    bust: optionalText,
    waist: optionalText,
    hips: optionalText,
    experience: optionalText,
    biography: optionalText,
    picture: asOptionalUrlOrPath,
  }),
  cover_message: z.string().max(2000).optional().default(""),
  promo_url: asOptionalUrlOrPath,
  images: z.preprocess((v) => {
    if (typeof v !== "string") return v ?? undefined;
    const s = v.trim();
    if (!s) return undefined;
    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  }, z.array(uploadedImageSchema).max(5).optional()),
});

export type ApplyInput = z.infer<typeof applySchema>;

const ARTIST_FIELDS = [
  "full_name",
  "date_of_birth",
  "phone",
  "instagram",
  "country",
  "weight",
  "height",
  "bust",
  "waist",
  "hips",
  "experience",
  "biography",
  "picture",
] as const;

/** Reads the apply FormData (artist_* fields) and validates it. */
export function parseApplyForm(fd: FormData): ApplyInput {
  const get = (key: string) => fd.get(key) ?? undefined;
  return applySchema.parse({
    job_id: get("job_id"),
    artist: Object.fromEntries(ARTIST_FIELDS.map((f) => [f, get(`artist_${f}`)])),
    cover_message: get("cover_message") ?? "",
    promo_url: get("promo_url"),
    images: get("images"),
  });
}
