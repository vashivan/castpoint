"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "../ds/Button";

export type UploadedImage = {
  secure_url: string;
  public_id: string;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
};

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET_TEMP = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_TEMP;
const MAX_PHOTOS = 5;

async function uploadToCloudinary(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", `${CLOUDINARY_UPLOAD_PRESET_TEMP}`);
  form.append("folder", "temp");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

/** Apply to a job with the logged-in artist's profile, an optional note and up to 5 photos. */
export default function ApplyModal({
  open,
  jobId,
  jobTitle,
  onClose,
}: {
  open: boolean;
  jobId: number;
  jobTitle: string;
  onClose: () => void;
}) {
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  useEffect(() => {
    const next = photos.map((f) => URL.createObjectURL(f));
    setPreviews(next);
    return () => next.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const onPickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const images = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    setPhotos((prev) => [...prev, ...images].slice(0, MAX_PHOTOS));
    e.target.value = "";
  };

  const submit = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setStatus("idle");

      const uploaded = photos.length ? await Promise.all(photos.map(uploadToCloudinary)) : [];

      const fd = new FormData();
      fd.append("job_id", String(jobId));
      fd.append("artist_full_name", user.name || "");

      const optional: [string, unknown][] = [
        ["artist_date_of_birth", user.date_of_birth],
        ["artist_phone", user.phone],
        ["artist_instagram", user.instagram],
        ["artist_country", user.country],
        ["artist_height", user.height],
        ["artist_weight", user.weight],
        ["artist_bust", user.bust],
        ["artist_waist", user.waist],
        ["artist_hips", user.hips],
        ["artist_experience", user.experience],
        ["artist_biography", user.biography],
        ["artist_picture", user.pic_url],
        ["promo_url", user.video_url],
      ];
      for (const [key, value] of optional) {
        if (value !== undefined && value !== null && value !== "") fd.append(key, String(value));
      }

      fd.append("cover_message", message);
      if (uploaded.length) fd.append("images", JSON.stringify(uploaded));

      const res = await fetch("/api/apply", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || "Failed");

      setStatus("ok");
      setTimeout(onClose, 5000);
    } catch (error) {
      console.error(error);
      setStatus("err");
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_PHOTOS - photos.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-xl border-[1.5px] border-ink bg-paper p-8 shadow-hard-pink"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute right-4 top-4 cursor-pointer" aria-label="Close">
              <X size={20} />
            </button>

            {status === "ok" ? (
              <div className="py-6">
                <p className="label text-ink/60">Application sent</p>
                <p className="font-display mt-3 text-[34px]">Break a leg!</p>
                <p className="mt-4 text-[15px] leading-relaxed">
                  Your profile went to the employer. We&apos;ll e-mail you when they reply.
                </p>
              </div>
            ) : (
              <>
                <p className="label text-ink/60">Apply with profile</p>
                <p className="font-display mt-2 text-[28px]">{jobTitle}</p>
                <p className="mt-4 text-[14px] leading-relaxed text-ink/80">
                  Your CV is generated from your profile and sent to the employer. Add a short note and up to five photos
                  if you like.
                </p>

                <label className="label mt-6 block text-ink/60" htmlFor="apply-note">Note to the employer</label>
                <textarea
                  id="apply-note"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A few words…"
                  className="mt-2 min-h-28 w-full border-[1.5px] border-ink bg-white p-3 text-[15px] outline-none focus:shadow-hard-sm"
                />

                <div className="mt-5 flex items-center justify-between">
                  <span className="label text-ink/60">Photos {photos.length}/{MAX_PHOTOS}</span>
                  <label className={`label border-[1.5px] border-ink px-3 py-2 ${remaining > 0 ? "cursor-pointer hover:bg-lime" : "opacity-40"}`}>
                    + Add photos
                    <input type="file" accept="image/*" multiple disabled={remaining <= 0} onChange={onPickPhotos} className="hidden" />
                  </label>
                </div>

                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {previews.map((src, idx) => (
                      <div key={src} className="relative aspect-square overflow-hidden border-[1.5px] border-ink">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`photo ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos((p) => p.filter((_, i) => i !== idx))}
                          className="absolute right-1 top-1 grid h-5 w-5 place-items-center bg-ink text-[10px] text-paper"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={submit} disabled={loading} arrow={!loading} className="mt-7 w-full">
                  {loading ? <Loader size={16} className="animate-spin" /> : "Send application"}
                </Button>

                {status === "err" && <p className="mt-4 text-sm font-semibold text-pink">Something went wrong. Try again later.</p>}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
