"use client";

import React, { useState } from "react";

type ContractType = "short" | "medium" | "long";

export default function EmployerNewJobPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ job_id: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    company_name: "",
    location: "",
    contract_type: "medium" as ContractType,
    salary_from: "",
    salary_to: "",
    currency: "$",
    apply_email: "",
    description: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ⚠️ тимчасово для тесту; далі заміниш на норм авторизацію
          "x-employer-id": "1",
        },
        body: JSON.stringify({
          ...form,
          salary_from: form.salary_from ? Number(form.salary_from) : undefined,
          salary_to: form.salary_to ? Number(form.salary_to) : undefined,
          apply_email: form.apply_email?.trim() ? form.apply_email.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create job");

      setDone({ job_id: data.job_id });
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto p-6 pt-30">
        <h1 className="text-2xl font-semibold">Vacancy submitted ✅</h1>
        <p className="mt-2 text-neutral-600">
          Your vacancy is now <b>pending moderation</b>. We’ll review it and activate it soon.
        </p>
        <div className="mt-4 rounded-2xl border p-4">
          <div className="text-sm text-neutral-600">Vacancy ID</div>
          <div className="text-lg font-semibold">{done.job_id}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-30">
      <h1 className="text-2xl font-semibold">Add a vacancy</h1>
      <p className="mt-2 text-neutral-600">
        Vacancies are published after moderation. Submit details below.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          <label className="text-sm">Job title</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            placeholder="Muscle male dancers wanted"
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Company / Venue</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.company_name}
            onChange={(e) => setForm((s) => ({ ...s, company_name: e.target.value }))}
            placeholder="Aurora Night Club"
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Location (country / city)</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.location}
            onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
            placeholder="China, Shanghai"
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Contract type</label>
          <select
            className="rounded-2xl border p-3 bg-white"
            value={form.contract_type}
            onChange={(e) => setForm((s) => ({ ...s, contract_type: e.target.value as ContractType }))}
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid gap-3">
            <label className="text-sm">Salary from</label>
            <input
              className="rounded-2xl border p-3 bg-white"
              value={form.salary_from}
              onChange={(e) => setForm((s) => ({ ...s, salary_from: e.target.value }))}
              placeholder="1400"
              inputMode="numeric"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Salary to</label>
            <input
              className="rounded-2xl border p-3 bg-white"
              value={form.salary_to}
              onChange={(e) => setForm((s) => ({ ...s, salary_to: e.target.value }))}
              placeholder="1600"
              inputMode="numeric"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Currency</label>
            <input
              className="rounded-2xl border p-3 bg-white"
              value={form.currency}
              onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
              placeholder="$"
            />
          </div>
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Apply email (optional)</label>
          <input
            className="rounded-2xl border p-3 bg-white"
            value={form.apply_email}
            onChange={(e) => setForm((s) => ({ ...s, apply_email: e.target.value }))}
            placeholder="hr@company.com"
            type="email"
          />
          <p className="text-xs text-neutral-500">
            If empty — you can keep the process through Castpoint manager.
          </p>
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Description</label>
          <textarea
            className="rounded-2xl border p-3 min-h-40 bg-white"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            placeholder="Requirements, schedule, accommodation, visa support, flight on approval and docs readiness…"
            required
          />
        </div>

        <button
          disabled={loading}
          className="rounded-2xl px-5 py-3 border font-medium hover:bg-neutral-50 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Submitting…" : "Submit for moderation"}
        </button>
      </form>
    </div>
  );
}
