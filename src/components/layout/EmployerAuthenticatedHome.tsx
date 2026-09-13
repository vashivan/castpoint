"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { useEmployerAuth } from "../../context/EmployerAuthContext";

type Job = {
  id: number;
  title: string;
  location: string;
  status: "pending" | "approved" | "rejected" | "closed";
  is_active: number;
  created_at?: string;
};

type EmployerApplication = {
  id: number;

  application_code: string | null;

  job_id: number;
  application_title: string | null;

  artist_name: string;
  artist_email: string | null;
  artist_phone: string | null;
  artist_instagram: string | null;
  artist_country: string | null;
  artist_date_of_birth: string | null;

  artist_height: string | null;
  artist_weight: string | null;
  artist_bust: string | null;
  artist_waist: string | null;
  artist_hips: string | null;

  artist_experience: string | null;
  artist_biography: string | null;
  artist_picture: string | null;

  promo_url: string | null;
  cover_message: string | null;

  status:
    | "pending"
    | "under_review"
    | "approved"
    | "rejected";

  created_at: string;
  updated_at: string;

  job_title: string;
  job_location: string | null;
  company_name: string | null;
};

export default function EmployerAuthenticatedHome() {
  const { employer } = useEmployerAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [applications, setApplications] = useState<
    EmployerApplication[]
  >([]);

  const [
    loadingApplications,
    setLoadingApplications,
  ] = useState(true);

  // -----------------------------
  // Load employer jobs
  // -----------------------------

  useEffect(() => {
    if (!employer) return;

    async function loadJobs() {
      try {
        const res = await fetch(
          "/api/employer/jobs",
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "Failed to load jobs"
          );
        }

        setJobs(data.jobs || []);
      } catch (error) {
        console.error(
          "[employer.home.jobs.error]",
          error
        );
      } finally {
        setLoadingJobs(false);
      }
    }

    loadJobs();
  }, [employer]);

  // -----------------------------
  // Load employer applications
  // -----------------------------

  useEffect(() => {
    if (!employer) return;

    async function loadApplications() {
      try {
        const res = await fetch(
          "/api/employer/applications",
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "Failed to load applications"
          );
        }

        setApplications(
          data.applications || []
        );
      } catch (error) {
        console.error(
          "[employer.home.applications.error]",
          error
        );
      } finally {
        setLoadingApplications(false);
      }
    }

    loadApplications();
  }, [employer]);

  if (!employer) return null;

  const recentJobs = jobs.slice(0, 4);

  const recentApplications =
    applications.slice(0, 4);

  // -----------------------------
  // Job status helpers
  // -----------------------------

  function getStatusLabel(job: Job) {
    if (
      job.status === "approved" &&
      job.is_active === 1
    ) {
      return "Active";
    }

    if (job.status === "pending") {
      return "Pending";
    }

    if (job.status === "rejected") {
      return "Rejected";
    }

    if (job.status === "closed") {
      return "Closed";
    }

    return job.status;
  }

  function getStatusClass(job: Job) {
    if (
      job.status === "approved" &&
      job.is_active === 1
    ) {
      return "bg-green-100 text-green-700";
    }

    if (job.status === "pending") {
      return "bg-orange-100 text-orange-700";
    }

    if (job.status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (job.status === "closed") {
      return "bg-neutral-100 text-neutral-600";
    }

    return "bg-neutral-100 text-neutral-600";
  }

  // -----------------------------
  // Application status helpers
  // -----------------------------

  function getApplicationStatusLabel(
    status: EmployerApplication["status"]
  ) {
    if (status === "pending") {
      return "Pending";
    }

    if (status === "under_review") {
      return "Under review";
    }

    if (status === "approved") {
      return "Approved";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    return status;
  }

  function getApplicationStatusClass(
    status: EmployerApplication["status"]
  ) {
    if (status === "pending") {
      return "bg-orange-100 text-orange-700";
    }

    if (status === "under_review") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-neutral-100 text-neutral-600";
  }

  return (
    <div className="min-h-screen bg-transparent px-6 py-30 text-black md:px-15">
      {/* WELCOME */}

      <div className="mb-10 text-center">
        <h2 className="text-3xl">
          Welcome back,{" "}
          {employer.contact_name} 👋
        </h2>

        {employer.company_name && (
          <p className="mt-2 text-neutral-500">
            {employer.company_name}
          </p>
        )}
      </div>

      {/* PENDING ACCOUNT */}

      {employer.status === "pending" && (
        <div className="mb-8 rounded-2xl border border-orange-300 bg-orange-50 p-5">
          <h3 className="font-semibold">
            Your employer account is
            pending verification
          </h3>

          <p className="mt-2 text-sm text-neutral-600">
            You can complete your company
            profile and prepare job listings
            while your account is being
            reviewed.
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6 md:grid-cols-6">

        {/* -------------------------------- */}
        {/* JOBS */}
        {/* -------------------------------- */}

        <div className="col-span-4 rounded-2xl border border-orange-500 bg-white/70 p-6 md:col-span-3">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold">
                🧾 My Job Offers
              </h3>

              <p className="mt-2 text-neutral-600">
                Create and manage job
                opportunities for artists.
              </p>
            </div>

            <Link
              href="/employer/jobs/new"
              className="shrink-0 rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 px-5 py-2 text-sm text-white"
            >
              + New job
            </Link>
          </div>

          {loadingJobs ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Loading vacancies…
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center">
              <p className="text-neutral-600">
                You haven&apos;t posted any
                vacancies yet.
              </p>

              <Link
                href="/employer/jobs/new"
                className="mt-4 inline-block text-sm underline"
              >
                Create your first vacancy
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/employer/jobs/${job.id}/applications`}
                  className="block rounded-2xl border p-4 hover:bg-white/40 shadow-none hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="truncate font-medium">
                        {job.title}
                      </h4>

                      <p className="mt-1 text-sm text-neutral-500">
                        {job.location}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        job
                      )}`}
                    >
                      {getStatusLabel(job)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/employer/jobs"
            className="mt-5 block w-full rounded-3xl border px-6 py-2 text-center"
          >
            View all jobs
          </Link>
        </div>

        {/* -------------------------------- */}
        {/* APPLICATIONS */}
        {/* -------------------------------- */}

        <div className="col-span-4 rounded-2xl border border-orange-500 bg-white/70 p-6 md:col-span-3">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold">
                📩 Applications
              </h3>

              <p className="mt-2 text-neutral-600">
                Review applications submitted
                by artists to your vacancies.
              </p>
            </div>

            {!loadingApplications &&
              applications.length > 0 && (
                <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium">
                  {applications.length}
                </span>
              )}
          </div>

          {loadingApplications ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Loading applications…
            </div>
          ) : recentApplications.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center">
              <p className="text-neutral-600">
                No applications yet.
              </p>

              <p className="mt-2 text-sm text-neutral-400">
                Applications from artists
                will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map(
                (application) => (
                  <Link
                    key={application.id}
                    href={`/employer/jobs/${application.job_id}/applications`}
                    className="block rounded-2xl border p-4 shadow-none hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-3">

                      {/* PHOTO */}

                      {application.artist_picture ? (
                        <img
                          src={
                            application.artist_picture
                          }
                          alt={
                            application.artist_name
                          }
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg">
                          👤
                        </div>
                      )}

                      {/* DATA */}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate font-medium">
                              {
                                application.artist_name
                              }
                            </h4>

                            <p className="mt-1 truncate text-sm text-neutral-500">
                              {application.job_title ||
                                application.application_title ||
                                "Job application"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getApplicationStatusClass(
                              application.status
                            )}`}
                          >
                            {getApplicationStatusLabel(
                              application.status
                            )}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                          {application.application_code && (
                            <span>
                              {
                                application.application_code
                              }
                            </span>
                          )}

                          {application.artist_country && (
                            <span>
                              {
                                application.artist_country
                              }
                            </span>
                          )}

                          {application.job_location && (
                            <span>
                              {
                                application.job_location
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}

          <Link
            href="/employer/applications"
            className="mt-5 block w-full rounded-3xl border px-6 py-2 text-center"
          >
            View all applications
          </Link>
        </div>

        {/* -------------------------------- */}
        {/* COMPANY PROFILE */}
        {/* -------------------------------- */}

        <div className="col-span-4 rounded-2xl border border-orange-500 bg-white/70 p-6 md:col-span-2">
          <h3 className="mb-4 text-xl font-bold">
            🏢 Company Profile
          </h3>

          <div className="flex flex-col items-center">
            {employer.logo_url ? (
              <img
                src={employer.logo_url}
                alt={employer.company_name}
                className="my-3 h-40 w-40 rounded-xl object-cover"
              />
            ) : (
              <div className="my-3 flex h-40 w-40 items-center justify-center rounded-xl bg-neutral-100 text-4xl">
                🏢
              </div>
            )}

            <h2 className="text-center text-2xl">
              {employer.company_name}
            </h2>

            {employer.country && (
              <p className="mt-1 text-neutral-500">
                {employer.country}
              </p>
            )}

            {employer.description && (
              <p className="my-4 text-justify">
                {employer.description}
              </p>
            )}
          </div>

          <Link
            href="/employer/profile"
            className="mt-4 block w-full rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-2 text-center text-white"
          >
            Edit profile
          </Link>
        </div>

        {/* -------------------------------- */}
        {/* CONTACT */}
        {/* -------------------------------- */}

        <div className="col-span-4 rounded-2xl border border-orange-500 bg-white/70 p-6 md:col-span-2">
          <h3 className="mb-4 text-xl font-bold">
            👤 Contact Information
          </h3>

          <div className="space-y-3 text-sm">

            {employer.contact_name && (
              <div>
                <p className="text-neutral-500">
                  Contact person
                </p>

                <p>
                  {employer.contact_name}
                </p>
              </div>
            )}

            <div>
              <p className="text-neutral-500">
                Email
              </p>

              <p className="break-words">
                {employer.email}
              </p>
            </div>

            {employer.phone && (
              <div>
                <p className="text-neutral-500">
                  Phone
                </p>

                <p>{employer.phone}</p>
              </div>
            )}

            {employer.website && (
              <div>
                <p className="text-neutral-500">
                  Website
                </p>

                <a
                  href={employer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words underline"
                >
                  {employer.website}
                </a>
              </div>
            )}

            {employer.instagram && (
              <div>
                <p className="text-neutral-500">
                  Instagram
                </p>

                <p>
                  {employer.instagram}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------- */}
        {/* ACCOUNT STATUS */}
        {/* -------------------------------- */}

        <div className="col-span-4 rounded-2xl border border-orange-500 bg-white/70 p-6 md:col-span-2">
          <h3 className="mb-4 text-xl font-bold">
            Account Status
          </h3>

          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                employer.status ===
                "verified"
                  ? "bg-green-500"
                  : employer.status ===
                      "pending"
                    ? "bg-orange-400"
                    : "bg-red-500"
              }`}
            />

            <span className="capitalize">
              {employer.status}
            </span>
          </div>

          {employer.status ===
            "pending" && (
            <p className="mt-4 text-sm text-neutral-600">
              Your account is currently
              being reviewed by Castpoint.
            </p>
          )}

          {employer.status ===
            "verified" && (
            <p className="mt-4 text-sm text-neutral-600">
              Your company has been
              verified.
            </p>
          )}

          {employer.status ===
            "blocked" && (
            <p className="mt-4 text-sm text-red-600">
              Your employer account has
              been blocked.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}