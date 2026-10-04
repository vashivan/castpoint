"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "../ds/Button";

const input = "mt-2 w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none focus:shadow-hard-sm";

export default function WriteReviewModal({
  open,
  onClose,
  onSaved,
  defaultCompany = "",
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultCompany?: string;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    company_name: defaultCompany,
    position: user?.role || "",
    place_of_work: "",
    content: "",
    anonymous: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.content.trim()) {
      setError("Company and review text are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/add_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ company_name: "", position: user?.role || "", place_of_work: "", content: "", anonymous: false });
      onSaved();
      onClose();
    } catch {
      setError("Something went wrong. Try again later.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-ink/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl border-[1.5px] border-ink bg-paper p-8 shadow-hard-lime"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <button type="button" onClick={onClose} className="absolute right-4 top-4 cursor-pointer" aria-label="Close">
              <X size={20} />
            </button>
            <p className="label text-ink/60">Write a review</p>
            <p className="font-display mt-2 text-[30px]">How was it, really?</p>

            <label className="label mt-6 block text-ink/60">
              Company, ship or agency
              <input className={input} value={form.company_name} onChange={set("company_name")} placeholder="e.g. Royal Caribbean" />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="label block text-ink/60">
                Your position
                <input className={input} value={form.position} onChange={set("position")} placeholder="Lead dancer" />
              </label>
              <label className="label block text-ink/60">
                Venue / place
                <input className={input} value={form.place_of_work} onChange={set("place_of_work")} placeholder="Ship, city, venue" />
              </label>
            </div>
            <label className="label mt-4 block text-ink/60">
              Your review
              <textarea
                className={`${input} min-h-36`}
                value={form.content}
                onChange={set("content")}
                placeholder="Pay, housing, hours, management. Would you go back?"
              />
            </label>
            <label className="mt-4 flex cursor-pointer items-center gap-3 text-[14px]">
              <input type="checkbox" checked={form.anonymous} onChange={set("anonymous")} className="h-4 w-4 accent-ink" />
              Publish anonymously
            </label>

            {error && <p className="mt-4 text-sm font-semibold text-pink">{error}</p>}
            <Button type="submit" disabled={saving} arrow className="mt-6 w-full">
              {saving ? "Publishing…" : "Publish review"}
            </Button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
