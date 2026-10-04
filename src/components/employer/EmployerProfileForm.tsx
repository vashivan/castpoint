"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmployerAuth } from "@/context/EmployerAuthContext";

export default function EmployerProfileForm() {
  const router = useRouter();
  const { employer, isLoading, isLogged, refreshEmployer: refresh } = useEmployerAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState({
    contact_name: "",
    company_name: "",
    phone: "",
    country: "",
    website: "",
    instagram: "",
    description: "",
    logo_url: "",
    logo_public_id: "",
  });

  useEffect(() => {
    if (!isLoading && !isLogged) router.replace("/employer/login");
  }, [isLoading, isLogged, router]);

  useEffect(() => {
    if (!employer) return;
    setForm({
      contact_name: employer.contact_name || "",
      company_name: employer.company_name || "",
      country: employer.country || "",
      phone: employer.phone || "",
      website: employer.website || "",
      instagram: employer.instagram || "",
      description: employer.description || "",
      logo_url: employer.logo_url || "",
      logo_public_id: employer.logo_public_id || "",
    });
  }, [employer]);

  // async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setUploadingLogo(true);
  //   setError(null);
  //   try {
  //     const uploaded = await uploadToCloudinary(file);
  //     setForm((s) => ({ ...s, logo_url: uploaded.secure_url, logo_public_id: uploaded.public_id }));
  //   } catch (err: any) {
  //     setError(err.message || "Logo upload failed");
  //   } finally {
  //     setUploadingLogo(false);
  //   }
  // }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/employer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      setSuccess(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !isLogged) {
    return <div className="max-w-2xl mx-auto px-4 py-14">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-display text-[clamp(34px,5vw,72px)]">Company profile</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">{error}</div>
        )}
        {success && (
          <div className="border-[1.5px] border-ink bg-lime px-4 py-3 text-[14px] font-semibold">
            Profile updated
          </div>
        )}

        {/* <div className="grid gap-3">
          <label className="label text-ink/60">Logo</label>
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="Company logo" className="w-20 h-20 object-cover border-[1.5px] border-ink" />
          )}
          <input type="file" accept="image/*" onChange={onLogoChange} disabled={uploadingLogo} />
          {uploadingLogo && <p className="text-xs text-ink/60">Uploading…</p>}
        </div> */}

        <div className="grid gap-3">
          <label className="label text-ink/60">Contact name</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.contact_name}
            onChange={(e) => setForm((s) => ({ ...s, contact_name: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Company name</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.company_name}
            onChange={(e) => setForm((s) => ({ ...s, company_name: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Country</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.country}
            onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Phone</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Website</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.website}
            onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
            placeholder="https://"
          />
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Instagram</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.instagram}
            onChange={(e) => setForm((s) => ({ ...s, instagram: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Description</label>
          <textarea
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)] min-h-32"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </div>

        <button
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 bg-ink px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.1em] text-paper shadow-[6px_6px_0_0_var(--color-pink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
