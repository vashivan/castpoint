"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmployerSession } from "./useEmployerSession";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

export default function EmployerProfileForm() {
  const router = useRouter();
  const { employer, isLoading, isLogged, refresh } = useEmployerSession();
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
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !isLogged) {
    return <div className="max-w-2xl mx-auto p-6 pt-30">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-30">
      <h1 className="text-2xl font-semibold">Company profile</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
        )}
        {success && (
          <div className="rounded-2xl border border-green-300 bg-green-50 p-3 text-green-700">
            Profile updated
          </div>
        )}

        {/* <div className="grid gap-3">
          <label className="text-sm">Logo</label>
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="Company logo" className="w-20 h-20 rounded-2xl object-cover border" />
          )}
          <input type="file" accept="image/*" onChange={onLogoChange} disabled={uploadingLogo} />
          {uploadingLogo && <p className="text-xs text-neutral-500">Uploading…</p>}
        </div> */}

        <div className="grid gap-3">
          <label className="text-sm">Contact name</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.contact_name}
            onChange={(e) => setForm((s) => ({ ...s, contact_name: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Company name</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.company_name}
            onChange={(e) => setForm((s) => ({ ...s, company_name: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Country</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.country}
            onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Phone</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Website</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.website}
            onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
            placeholder="https://"
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Instagram</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.instagram}
            onChange={(e) => setForm((s) => ({ ...s, instagram: e.target.value }))}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Description</label>
          <textarea
            className="rounded-2xl border p-3 min-h-32 bg-white"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </div>

        <button
          disabled={saving}
          className="rounded-2xl px-5 py-3 border font-medium hover:bg-neutral-50 disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
