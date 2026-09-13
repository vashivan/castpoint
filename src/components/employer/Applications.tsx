"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useEmployerAuth } from "../../context/EmployerAuthContext";

type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

type ApplicationFilter = "all" | ApplicationStatus;

type EmployerApplication = {
  id: number;
  application_code: string | null;
  job_id: number;
  application_title: string | null;
  artist_name: string;
  artist_country: string | null;
  artist_picture: string | null;
  status: ApplicationStatus;
  created_at: string;
  job_title: string;
  job_location: string | null;
};

type StatusOption = {
  label: string;
  value: ApplicationFilter;
};

const statusOptions: StatusOption[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Under review",
    value: "under_review",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
];

function isApplicationFilter(value: string): value is ApplicationFilter {
  return statusOptions.some((option) => option.value === value);
}

export default function EmployerApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { employer, isLoading, isLogged } = useEmployerAuth();

  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const statusFromUrl = searchParams?.get("status") ?? "all";

  const currentStatus: ApplicationFilter = isApplicationFilter(statusFromUrl)
    ? statusFromUrl
    : "all";

 useEffect(() => {
  if (!isLogged) {
    setLoading(false);
    return;
  }

  let cancelled = false;

  async function loadApplications() {
    setLoading(true);

    try {
      const res = await fetch("/api/employer/applications", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Failed to load applications"
        );
      }

      if (!cancelled) {
        setApplications(data.applications ?? []);
      }
    } catch (error) {
      console.error(
        "[employer.applications.error]",
        error
      );

      if (!cancelled) {
        setApplications([]);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void loadApplications();

  return () => {
    cancelled = true;
  };
}, [isLogged]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      if (
        currentStatus !== "all" &&
        application.status !== currentStatus
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableValues = [
        application.artist_name,
        application.application_code,
        application.job_title,
        application.application_title,
        application.artist_country,
        application.job_location,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(query)
      );
    });
  }, [applications, search, currentStatus]);

  const statusCounts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter(
        (application) => application.status === "pending"
      ).length,
      under_review: applications.filter(
        (application) => application.status === "under_review"
      ).length,
      approved: applications.filter(
        (application) => application.status === "approved"
      ).length,
      rejected: applications.filter(
        (application) => application.status === "rejected"
      ).length,
    };
  }, [applications]);

  function changeStatusFilter(status: ApplicationFilter) {
    if (status === "all") {
      router.push("/employer/applications");
      return;
    }

    router.push(`/employer/applications?status=${status}`);
  }

  if (isLoading || !isLogged) {
    return (
       <div className="mx-auto max-w-6xl px-6 py-30">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-30">
      {/* HEADER */}

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-neutral-500">
            {employer?.company_name}
          </p>

          <h1 className="mt-1 text-3xl font-semibold">
            Applications
          </h1>

          <p className="mt-2 text-neutral-500">
            Review artists who applied to your job offers.
          </p>
        </div>

        <Link
          href="/employer/dashboard"
          className="rounded-2xl border px-5 py-2 text-sm  bg-white/70 font-medium shadow-none hover:shadow-lg transition-shadow duration-300"
        >
          Back to dashboard
        </Link>
      </div>

      {/* FILTERS */}

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {statusOptions.map((option) => {
          const active = currentStatus === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => changeStatusFilter(option.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-orange-500 bg-orange-50"
                  : "hover:shadow-lg transition-shadow duration-300"
              }`}
            >
              <div className="text-sm text-neutral-500">
                {option.label}
              </div>

              <div className="mt-1 text-2xl font-semibold">
                {statusCounts[option.value]}
              </div>
            </button>
          );
        })}
      </div>

      {/* SEARCH */}

      <div className="mt-8">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by artist, vacancy or application code…"
          className="w-full rounded-2xl border px-5 py-3 outline-none transition focus:border-orange-500"
        />
      </div>

      {/* APPLICATIONS */}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border p-8 text-center text-neutral-500">
            Loading applications…
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-lg font-medium">
              No applications
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              No applications match the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <Link
                key={application.id}
                href={`/employer/jobs/${application.job_id}/applications/${application.id}`}
                className="block rounded-2xl border p-5 bg-white/70 px-5 py-3 font-medium shadow-none hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-4">
                  <ArtistAvatar application={application} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-medium">
                          {application.artist_name}
                        </h2>

                        <p className="mt-1 truncate text-sm text-neutral-500">
                          {application.job_title ||
                            application.application_title ||
                            "Job application"}
                        </p>
                      </div>

                      <StatusBadge status={application.status} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                      {application.application_code && (
                        <span>{application.application_code}</span>
                      )}

                      {application.artist_country && (
                        <span>{application.artist_country}</span>
                      )}

                      {application.job_location && (
                        <span>{application.job_location}</span>
                      )}

                      {application.created_at && (
                        <span>
                          {new Date(
                            application.created_at
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className="hidden text-xl text-neutral-300 md:block"
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArtistAvatar({
  application,
}: {
  application: EmployerApplication;
}) {
  if (!application.artist_picture) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xl">
        👤
      </div>
    );
  }

  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100">
      <Image
        src={application.artist_picture}
        alt={application.artist_name}
        fill
        sizes="56px"
        className="object-cover"
      />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const labels: Record<ApplicationStatus, string> = {
    pending: "Pending",
    under_review: "Under review",
    approved: "Approved",
    rejected: "Rejected",
  };

  const colors: Record<ApplicationStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${colors[status]}`}
    >
      {labels[status]}
    </span>
  );
}