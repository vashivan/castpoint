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
       <div className="mx-auto max-w-7xl px-4 py-14">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* HEADER */}

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-ink/60">
            {employer?.company_name}
          </p>

          <h1 className="mt-1 font-display text-[clamp(34px,5vw,72px)]">
            Applications
          </h1>

          <p className="mt-2 text-ink/60">
            Review artists who applied to your job offers.
          </p>
        </div>

        <Link
          href="/employer/dashboard"
          className="inline-flex items-center justify-center gap-2 border-[1.5px] border-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-ink hover:text-paper disabled:opacity-50 cursor-pointer"
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
              className={`border-[1.5px] border-ink p-4 text-left transition ${
                active ? "bg-lime shadow-[4px_4px_0_0_var(--color-ink)]" : "bg-white hover:bg-lime/40"
              }`}
            >
              <div className="text-sm text-ink/60">
                {option.label}
              </div>

              <div className="mt-1 font-display text-[clamp(28px,3.4vw,44px)]">
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
          className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
        />
      </div>

      {/* APPLICATIONS */}

      <div className="mt-6">
        {loading ? (
          <div className="border-[1.5px] border-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-ink)] text-center text-ink/60">
            Loading applications…
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="border-[1.5px] border-dashed border-ink p-10 text-center">
            <p className="font-display text-[22px]">
              No applications
            </p>

            <p className="mt-2 text-sm text-ink/60">
              No applications match the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <Link
                key={application.id}
                href={`/employer/jobs/${application.job_id}/applications/${application.id}`}
                className="block border-[1.5px] border-ink bg-white p-5 transition-shadow hover:shadow-[4px_4px_0_0_var(--color-ink)]"
              >
                <div className="flex items-center gap-4">
                  <ArtistAvatar application={application} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-medium">
                          {application.artist_name}
                        </h2>

                        <p className="mt-1 truncate text-sm text-ink/60">
                          {application.job_title ||
                            application.application_title ||
                            "Job application"}
                        </p>
                      </div>

                      <StatusBadge status={application.status} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/50">
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
                    className="hidden text-xl text-ink/30 md:block"
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
      <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-stone text-xl">
        👤
      </div>
    );
  }

  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-stone">
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
    pending: "border border-ink text-ink",
    under_review: "bg-blue text-paper",
    approved: "bg-lime text-ink",
    rejected: "bg-pink text-ink",
  };

  return (
    <span
      className={`shrink-0 inline-block px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em] leading-none ${colors[status]}`}
    >
      {labels[status]}
    </span>
  );
}