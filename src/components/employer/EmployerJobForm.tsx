"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmployerAuth } from "../../context/EmployerAuthContext";
import { DISCIPLINES, contractLabel } from "@/lib/jobFormat";
import { cn } from "@/lib/utils";

type Props = {
  jobId?: number; // omit for "create new job" mode
};

export default function EmployerJobForm({ jobId }: Props) {
  const router = useRouter();
  const { isLoading, isLogged, employer } = useEmployerAuth();
  const [loadingJob, setLoadingJob] = useState(!!jobId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    location: "",
    discipline: "",
    contract_months: "",
    contract_extendable: false,
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
          discipline: job.discipline || "",
          contract_months: job.contract_months != null ? String(job.contract_months) : "",
          contract_extendable: Boolean(job.contract_extendable),
          salary_from: job.salary_from != null ? String(job.salary_from) : "",
          salary_to: job.salary_to != null ? String(job.salary_to) : "",
          currency: job.currency || "$",
          apply_email: job.apply_email || "",
          description: job.description || "",
        });
        setCurrentStatus(job.status || (job.is_active ? "published" : "draft"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading job");
      } finally {
        setLoadingJob(false);
      }
    })();
  }, [isLogged, jobId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const months = Number(form.contract_months);
    if (!form.discipline) return setError("Choose who you are looking for");
    if (!Number.isInteger(months) || months < 1 || months > 60) return setError("Contract length must be 1–60 months");

    setSaving(true);

    const payload = {
      ...form,

      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      currency: form.currency.trim(),
      contract_months: months,

      salary_from: form.salary_from
        ? Number(form.salary_from)
        : undefined,

      salary_to: form.salary_to
        ? Number(form.salary_to)
        : undefined,

      apply_email: form.apply_email.trim()
        ? form.apply_email.trim()
        : null,
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || loadingJob) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      Loading…
    </div>
  );
}

if (!isLogged) {
  return null;
}

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14">
        <h1 className="font-display text-[clamp(34px,5vw,72px)]">Changes submitted ✅</h1>
        <p className="mt-2 text-ink/70">
          Your changes are now pending moderation. We&apos;ll review and publish shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-display text-[clamp(34px,5vw,72px)]">{jobId ? "Edit vacancy" : "Add a vacancy"}</h1>
      <p className="mt-2 text-ink/70">
        Vacancies are published after moderation. Submit details below.
      </p>
      {jobId && currentStatus && (
        <p className="mt-1 text-sm text-ink/60">Current status: {currentStatus}</p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">{error}</div>
        )}

        <div className="grid gap-3">
          <label className="label text-ink/60">Job title</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            placeholder="Muscle male dancers wanted"
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Location (country / city)</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.location}
            onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
            placeholder="China, Shanghai"
            required
          />
        </div>

        <fieldset className="grid gap-3">
          <legend className="label mb-3 text-ink/60">Who are you looking for?</legend>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES.map((d) => (
              <button
                key={d.value}
                type="button"
                aria-pressed={form.discipline === d.value}
                onClick={() => setForm((s) => ({ ...s, discipline: d.value }))}
                className={cn(
                  "border-[1.5px] border-ink px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] cursor-pointer",
                  form.discipline === d.value ? "bg-ink text-paper shadow-[4px_4px_0_0_var(--color-pink)]" : "bg-white hover:bg-lime"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3">
          <label className="label text-ink/60" htmlFor="contract_months">Contract length (months)</label>
          <div className="flex items-center gap-4">
            <input
              id="contract_months"
              type="number"
              min={1}
              max={60}
              inputMode="numeric"
              className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)] max-w-40"
              value={form.contract_months}
              onChange={(e) => setForm((s) => ({ ...s, contract_months: e.target.value.replace(/[^\d]/g, "") }))}
              placeholder="12"
              required
            />
            {Number(form.contract_months) > 0 && (
              <span className="font-display text-[22px]">
                {contractLabel({ contract_months: Number(form.contract_months), contract_extendable: form.contract_extendable })}
              </span>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              checked={form.contract_extendable}
              onChange={(e) => setForm((s) => ({ ...s, contract_extendable: e.target.checked }))}
              className="h-4 w-4 accent-ink"
            />
            With option to extend
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid gap-3">
            <label className="label text-ink/60">Salary from</label>
            <input
              className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
              value={form.salary_from}
              onChange={(e) => setForm((s) => ({ ...s, salary_from: e.target.value }))}
              placeholder="1400"
              inputMode="numeric"
            />
          </div>
          <div className="grid gap-2">
            <label className="label text-ink/60">Salary to</label>
            <input
              className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
              value={form.salary_to}
              onChange={(e) => setForm((s) => ({ ...s, salary_to: e.target.value }))}
              placeholder="1600"
              inputMode="numeric"
            />
          </div>
          <div className="grid gap-2">
            <label className="label text-ink/60">Currency</label>
            <input
              className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
              value={form.currency}
              onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
              placeholder="$"
            />
          </div>
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Apply email (optional)</label>
          <input
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
            value={form.apply_email}
            onChange={(e) => setForm((s) => ({ ...s, apply_email: e.target.value }))}
            placeholder={employer?.email || "hr@company.com"}
            type="email"
          />
          <p className="text-xs text-ink/60">
            If empty, applications go to your account e-mail.
          </p>
        </div>

        <div className="grid gap-3">
          <label className="label text-ink/60">Description</label>
          <textarea
            className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)] min-h-40"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            placeholder="Requirements, schedule, accommodation, visa support, flight on approval and docs readiness…"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-ink px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.1em] text-paper shadow-[6px_6px_0_0_var(--color-pink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Submitting…" : jobId ? "Save & submit for review" : "Submit for moderation"}
          </button>

          {jobId && (
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 border-[1.5px] border-ink bg-pink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] hover:shadow-[4px_4px_0_0_var(--color-ink)] disabled:opacity-50 cursor-pointer"
            >
              Close job
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
