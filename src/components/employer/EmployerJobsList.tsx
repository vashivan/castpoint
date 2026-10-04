"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEmployerAuth } from "@/context/EmployerAuthContext";

type Job = {
  id: number;
  title: string;
  location: string;
  contract_type: string;
  is_active: number;
  status: string | null;
  created_at: string;
};

export default function EmployerJobsList() {
  const router = useRouter();
  const { isLoading, isLogged } = useEmployerAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLogged) router.replace("/employer/login");
  }, [isLoading, isLogged, router]);

  useEffect(() => {
    if (!isLogged) return;
    (async () => {
      try {
        const res = await fetch("/api/employer/jobs", { credentials: "include" });
        const data = await res.json();
        if (res.ok) setJobs(data.jobs || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLogged]);

  if (isLoading || !isLogged) {
    return <div className="max-w-5xl mx-auto px-4 py-14">Loading…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[clamp(34px,5vw,72px)]">Your jobs</h1>
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center justify-center gap-2 border-[1.5px] border-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-ink hover:text-paper disabled:opacity-50 cursor-pointer"
        >
          Post a job
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-ink/60">Loading jobs…</p>}
        {!loading && jobs.length === 0 && (
          <p className="text-sm text-ink/60">You haven&apos;t posted any jobs yet.</p>
        )}
        {jobs.map((job) => (
          <div key={job.id} className="border-[1.5px] border-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-ink)] flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">{job.title}</div>
              <div className="text-sm text-ink/60">{job.location}</div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge isActive={job.is_active} status={job.status} />
              <Link href={`/employer/jobs/${job.id}/applications`} className="text-sm underline">
                Applications
              </Link>
              <Link href={`/employer/jobs/${job.id}/edit`} className="text-sm underline">
                Edit
              </Link>
            </div>
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
      ? "bg-lime text-ink"
      : label === "pending"
      ? "border border-ink text-ink"
      : label === "rejected"
      ? "bg-pink text-ink"
      : label === "closed"
      ? "bg-stone text-ink/60"
      : "bg-stone text-ink";
  return <span className={`inline-block px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em] leading-none ${color}`}>{label}</span>;
}
