"use client";

import React, { useEffect, useState } from "react";

type AdminJob = {
  id: number;
  title: string;
  location: string;
  contract_type: string;
  salary_from: number | null;
  salary_to: number | null;
  currency: string;
  description: string;
  apply_email: string | null;
  is_active: number;
  status: string | null;
  company_name: string;
  created_at: string;
  employer_id: number | null;
  employer_email: string | null;
  employer_status: string | null;
};

export default function AdminJobsModeration() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  async function load(all: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs?status=${all ? "all" : "pending"}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load jobs");
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(showAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);

  async function moderate(jobId: number, action: "approve" | "reject") {
    setBusyId(jobId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update job");
      setJobs((prev) => prev.filter((j) => j.id !== jobId || showAll));
      if (showAll) load(true);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setBusyId(null);
    }
  }

  if (unauthorized) {
    return (
      <div className="max-w-3xl mx-auto p-6 pt-30">
        <h1 className="text-2xl font-semibold">Admin — job moderation</h1>
        <p className="mt-4 text-neutral-600">
          You&apos;re not signed in as an admin. Log in at <code>/login</code> with an account
          whose <code>role</code> column is set to <code>admin</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 pt-30">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Job moderation</h1>
        <button className="text-sm underline" onClick={() => setShowAll((s) => !s)}>
          {showAll ? "Show pending only" : "Show all jobs"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-neutral-500">Loading…</p>}
        {!loading && jobs.length === 0 && (
          <p className="text-sm text-neutral-500">Nothing to review.</p>
        )}

        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{job.title}</div>
                <div className="text-sm text-neutral-500">
                  {job.company_name} · {job.location} · {job.employer_email || "no employer email"}
                </div>
              </div>
              <StatusBadge isActive={job.is_active} status={job.status} />
            </div>

            <p className="mt-3 text-sm text-neutral-700 whitespace-pre-line">{job.description}</p>

            {job.status === "pending" && (
              <div className="mt-4 flex gap-3">
                <button
                  disabled={busyId === job.id}
                  onClick={() => moderate(job.id, "approve")}
                  className="rounded-xl px-4 py-2 border font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  disabled={busyId === job.id}
                  onClick={() => moderate(job.id, "reject")}
                  className="rounded-xl px-4 py-2 border font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ isActive, status }: { isActive: number; status: string | null }) {
  const label = status || (isActive ? "published" : "draft");
  const color =
    label === "published"
      ? "bg-green-100 text-green-700"
      : label === "pending"
      ? "bg-amber-100 text-amber-700"
      : label === "rejected"
      ? "bg-red-100 text-red-700"
      : label === "closed"
      ? "bg-neutral-200 text-neutral-600"
      : "bg-neutral-100 text-neutral-700";
  return <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{label}</span>;
}
