"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEmployerSession } from "./useEmployerSession";

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
  const { isLoading, isLogged } = useEmployerSession();
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
    return <div className="max-w-4xl mx-auto p-6 pt-30">Loading…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-30">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your jobs</h1>
        <Link
          href="/employer/jobs/new"
          className="rounded-2xl px-5 py-3 border font-medium hover:bg-neutral-50"
        >
          Post a job
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-neutral-500">Loading jobs…</p>}
        {!loading && jobs.length === 0 && (
          <p className="text-sm text-neutral-500">You haven&apos;t posted any jobs yet.</p>
        )}
        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">{job.title}</div>
              <div className="text-sm text-neutral-500">{job.location}</div>
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
