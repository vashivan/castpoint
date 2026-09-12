"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployerRegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    contact_name: "",
    email: "",
    password: "",
    confirm_password: "",
    company_name: "",
    country: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");

      router.push("/employer/dashboard");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-30">
      <h1 className="text-2xl font-semibold">Create an employer account</h1>
      <p className="mt-2 text-neutral-600">
        Post jobs, manage applications, and build your company profile on Castpoint.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          <label className="text-sm">Full name</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.contact_name}
            onChange={(e) => setForm((s) => ({ ...s, contact_name: e.target.value }))}
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Company name</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.company_name}
            onChange={(e) => setForm((s) => ({ ...s, company_name: e.target.value }))}
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Country</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.country}
            onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Work email</label>
          <input
            type="email"
            className="rounded-2xl border p-3 bg-white"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="rounded-2xl border p-3 bg-white"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            minLength={8}
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Confirm password</label>
          <input
            type="password"
            className="rounded-2xl border p-3 bg-white"
            value={form.confirm_password}
            onChange={(e) => setForm((s) => ({ ...s, confirm_password: e.target.value }))}
            minLength={8}
            required
          />
        </div>

        <button
          disabled={loading}
          className="rounded-2xl px-5 py-3 border font-medium hover:bg-neutral-50 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Creating account…" : "Create employer account"}
        </button>

        <p className="text-sm text-neutral-500">
          Already have an employer account?{" "}
          <Link href="/employer/login" className="underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
