"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEmployerAuth } from "../../context/EmployerAuthContext";

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
  status: "pending" | "approved" | "rejected" | "closed" | null;
  created_at: string;
};

export default function EmployerDashboard() {
  const router = useRouter();

  const {
    employer,
    isLoading,
    isLogged,
  } = useEmployerAuth();

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

    async function loadDashboard() {
      try {
        const res = await fetch(
          "/api/employer/dashboard",
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
            "Failed to load dashboard"
          );
        }

        setStats(
          data.stats || {
            active_jobs: 0,
            pending_jobs: 0,
            total_applications: 0,
            new_applications: 0,
          }
        );

        setRecentJobs(
          data.recent_jobs || []
        );
      } catch (error) {
        console.error(
          "[employer.dashboard.error]",
          error
        );
      } finally {
        setLoadingStats(false);
      }
    }

    loadDashboard();
  }, [isLogged]);

  if (isLoading || !isLogged) {
    return (
      <div className="mx-auto max-w-4xl p-6 pt-30">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pt-30">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {employer?.company_name}
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Profile status:{" "}
            <span
              className={
                employer?.status === "verified"
                  ? "font-medium text-green-600"
                  : employer?.status === "blocked"
                    ? "font-medium text-red-600"
                    : "font-medium text-amber-600"
              }
            >
              {employer?.status}
            </span>
          </p>
        </div>

        <Link
          href="/employer/jobs/new"
          className="rounded-2xl bg-white/70 border px-5 py-3 font-medium shadow-none hover:shadow-lg transition-shadow duration-300 "
        >
          Post a job
        </Link>
      </div>

      {/* STATS */}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          label="Active jobs"
          value={stats?.active_jobs}
          loading={loadingStats}
        />

        <StatCard
          label="Pending review"
          value={stats?.pending_jobs}
          loading={loadingStats}
        />

        <Link
          href="/employer/applications"
          className="block"
        >
          <StatCard
            label="Total applications"
            value={stats?.total_applications}
            loading={loadingStats}
          />
        </Link>

        <Link
          href="/employer/applications?status=pending"
          className="block"
        >
          <StatCard
            label="New applications"
            value={stats?.new_applications}
            loading={loadingStats}
          />
        </Link>
      </div>

      {/* RECENT JOBS */}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Recent jobs
          </h2>

          <Link
            href="/employer/jobs"
            className="text-sm underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {recentJobs.length === 0 && (
            <p className="text-sm text-neutral-500">
              You haven&apos;t posted any jobs yet.
            </p>
          )}

          {recentJobs.map((job) => (
            <Link
              key={job.id}
              href={`/employer/jobs/${job.id}/edit`}
              className="block rounded-2xl border p-4 bg-white/70 border px-5 py-3 font-medium shadow-none hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {job.title}
                  </div>

                  <div className="text-sm text-neutral-500">
                    {job.location}
                  </div>

                  <div className="mt-3 underline">Click to edit</div>
                </div>

                <StatusBadge
                  isActive={job.is_active}
                  status={job.status}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* LINKS */}

      <div className="mt-10 flex flex-wrap gap-6">
        <Link
          href="/employer/applications"
          className="text-sm underline"
        >
          View applications
        </Link>

        <Link
          href="/employer/profile"
          className="text-sm underline"
        >
          Edit company profile
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div className="h-full rounded-2xl p-4 bg-white/70 border px-5 py-3 font-medium shadow-none hover:shadow-lg transition-shadow duration-300">
      <div className="text-sm text-neutral-500">
        {label}
      </div>

      <div className="mt-1 text-2xl font-semibold">
        {loading ? "—" : value ?? 0}
      </div>
    </div>
  );
}

function StatusBadge({
  isActive,
  status,
}: {
  isActive: number;
  status: RecentJob["status"];
}) {
  let label = status || "pending";

  if (
    status === "approved" &&
    isActive === 1
  ) {
    label = "approved";
  }

  const color =
    label === "approved"
      ? "bg-green-100 text-green-700"
      : label === "pending"
        ? "bg-amber-100 text-amber-700"
        : label === "rejected"
          ? "bg-red-100 text-red-700"
          : label === "closed"
            ? "bg-neutral-100 text-neutral-600"
            : "bg-neutral-100 text-neutral-700";

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs ${color}`}
    >
      {label}
    </span>
  );
}