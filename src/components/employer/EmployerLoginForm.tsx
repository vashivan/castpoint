"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployerLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/employer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");

      router.push("/employer/dashboard");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 pt-30">
      <h1 className="text-2xl font-semibold">Employer login</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          <label className="text-sm">Email</label>
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
            required
          />
        </div>

        <button
          disabled={loading}
          className="rounded-2xl px-5 py-3 border font-medium hover:bg-neutral-50 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="text-sm text-neutral-500">
          Don&apos;t have an employer account yet?{" "}
          <Link href="/employer/register" className="underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
