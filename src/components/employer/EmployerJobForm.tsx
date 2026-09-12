"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmployerSession } from "./useEmployerSession";

type ContractType = "short" | "medium" | "long";

type Props = {
  jobId?: number; // omit for "create new job" mode
};

export default function EmployerJobForm({ jobId }: Props) {
  const router = useRouter();
  const { isLoading, isLogged } = useEmployerSession();
  const [loadingJob, setLoadingJob] = useState(!!jobId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    location: "",
    contract_type: "medium" as ContractType,
    salary_from: "",
    salary_to: "",
    currency: "$",
    apply_email: "",
    description: "",
  });

  useEffect(() => {
    if (!isLoading && !isLogged) router.replace("/employer/login");
  }, [isLoading, isLogged, router]);

  useEffect(() => {
    if (!isLogged || !jobId) return;
    (async () => {
      try {
        const res = await fetch(`/api/employer/jobs/${jobId}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load job");
        const job = data.job;
        setForm({
          title: job.title || "",
          location: job.location || "",
          contract_type: job.contract_type || "medium",
          salary_from: job.salary_from != null ? String(job.salary_from) : "",
          salary_to: job.salary_to != null ? String(job.salary_to) : "",
          currency: job.currency || "$",
          apply_email: job.apply_email || "",
          description: job.description || "",
        });
        setCurrentStatus(job.status || (job.is_active ? "published" : "draft"));
      } catch (err: any) {
        setError(err.message || "Error loading job");
      } finally {
        setLoadingJob(false);
      }
    })();
  }, [isLogged, jobId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      ...form,
      salary_from: form.salary_from ? Number(form.salary_from) : undefined,
      salary_to: form.salary_to ? Number(form.salary_to) : undefined,
      apply_email: form.apply_email?.trim() ? form.apply_email.trim() : undefined,
    };

    try {
      if (jobId) {
        const res = await fetch(`/api/employer/jobs/${jobId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...payload, action: "resubmit" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to update job");
        setDone(true);
      } else {
        const res = await fetch("/api/employer/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create job");
        router.push("/employer/jobs");
      }
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  async function onClose() {
    if (!jobId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "close" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to close job");
      router.push("/employer/jobs");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !isLogged || loadingJob) {
    return <div className="max-w-2xl mx-auto p-6 pt-30">Loading…</div>;
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto p-6 pt-30">
        <h1 className="text-2xl font-semibold">Changes submitted ✅</h1>
        <p className="mt-2 text-neutral-600">
          Your changes are now pending moderation. We&apos;ll review and publish shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-30">
      <h1 className="text-2xl font-semibold">{jobId ? "Edit vacancy" : "Add a vacancy"}</h1>
      <p className="mt-2 text-neutral-600">
        Vacancies are published after moderation. Submit details below.
      </p>
      {jobId && currentStatus && (
        <p className="mt-1 text-sm text-neutral-500">Current status: {currentStatus}</p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
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

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="rounded-2xl px-5 py-3 border font-medium hover:bg-neutral-50 disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Submitting…" : jobId ? "Save & submit for review" : "Submit for moderation"}
          </button>

          {jobId && (
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-2xl px-5 py-3 border font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
            >
              Close job
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
