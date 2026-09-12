"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEmployerSession } from "./useEmployerSession";

type Stats = {
  active_jobs: number;
  pending_jobs: number;
  total_applications: number;
  new_applications: number;
};

type RecentJob = {
  id: number;
  title: string;
  location: string;
  is_active: number;
  status: string | null;
  created_at: string;
};

export default function EmployerDashboard() {
  const router = useRouter();
  const { employer, isLoading, isLogged } = useEmployerSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLogged) {
      router.replace("/employer/login");
    }
  }, [isLoading, isLogged, router]);

  useEffect(() => {
    if (!isLogged) return;
    (async () => {
      try {
        const res = await fetch("/api/employer/dashboard", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setStats(data.stats);
          setRecentJobs(data.recent_jobs || []);
        }
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [isLogged]);

  if (isLoading || !isLogged) {
    return <div className="max-w-4xl mx-auto p-6 pt-30">Loading…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-30">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{employer?.company_name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Profile status:{" "}
            <span
              className={
                employer?.status === "verified"
                  ? "text-green-600 font-medium"
                  : employer?.status === "blocked"
                  ? "text-red-600 font-medium"
                  : "text-amber-600 font-medium"
              }
            >
              {employer?.status}
            </span>
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="rounded-2xl px-5 py-3 border font-medium hover:bg-neutral-50"
        >
          Post a job
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active jobs" value={stats?.active_jobs} loading={loadingStats} />
        <StatCard label="Pending review" value={stats?.pending_jobs} loading={loadingStats} />
        <StatCard label="Total applications" value={stats?.total_applications} loading={loadingStats} />
        <StatCard label="New applications" value={stats?.new_applications} loading={loadingStats} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent jobs</h2>
          <Link href="/employer/jobs" className="text-sm underline">
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {recentJobs.length === 0 && (
            <p className="text-sm text-neutral-500">You haven&apos;t posted any jobs yet.</p>
          )}
          {recentJobs.map((job) => (
            <Link
              key={job.id}
              href={`/employer/jobs/${job.id}/edit`}
              className="block rounded-2xl border p-4 hover:bg-neutral-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-sm text-neutral-500">{job.location}</div>
                </div>
                <StatusBadge isActive={job.is_active} status={job.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Link href="/employer/profile" className="text-sm underline">
          Edit company profile
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, loading }: { label: string; value?: number; loading: boolean }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{loading ? "—" : value ?? 0}</div>
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
      : "bg-neutral-100 text-neutral-700";
  return <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{label}</span>;
}
