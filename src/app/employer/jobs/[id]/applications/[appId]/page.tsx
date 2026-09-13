"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useEmployerAuth } from "../../../../../../context/EmployerAuthContext";
import MainLayout from "@/layouts/MainLayout";

type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

type Application = {
  id: number;
  application_code: string | null;
  job_id: number;

  artist_name: string | null;
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
  application_title: string | null;

  status: ApplicationStatus;
  created_at: string;
  updated_at: string;

  job_title: string | null;
  job_location: string | null;
  company_name: string | null;
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "pending",
  "under_review",
  "approved",
  "rejected",
];

export default function EmployerApplicationPage() {
  const params = useParams<{
    id: string;
    appId: string;
  }>();

  const router = useRouter();

  const { isLoading, isLogged } = useEmployerAuth();

  const jobId = Number(params?.id);
  const appId = Number(params?.appId);

  const invalidParams =
    !Number.isInteger(jobId) ||
    !Number.isInteger(appId) ||
    jobId <= 0 ||
    appId <= 0;

  const [application, setApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isLoading && !isLogged) {
      router.replace("/employer/login");
    }
  }, [isLoading, isLogged, router]);

  useEffect(() => {
    if (!isLogged) return;

    if (invalidParams) {
      setLoading(false);
      setError("Invalid application URL");
      return;
    }

    let cancelled = false;

    async function loadApplication() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/employer/jobs/${jobId}/applications/${appId}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "Failed to load application"
          );
        }

        if (!cancelled) {
          setApplication(data.application);
        }
      } catch (error) {
        if (!cancelled) {
          setApplication(null);

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load application"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadApplication();

    return () => {
      cancelled = true;
    };
  }, [
    isLogged,
    jobId,
    appId,
    invalidParams,
  ]);

  async function changeStatus(
    status: ApplicationStatus
  ) {
    if (
      !application ||
      invalidParams ||
      updating
    ) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/employer/jobs/${jobId}/applications/${appId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Failed to update status"
        );
      }

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              status,
            }
          : prev
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update status"
      );
    } finally {
      setUpdating(false);
    }
  }

  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-4xl px-6 py-30">
          Loading…
        </div>
      </MainLayout>
    );
  }

  if (invalidParams) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-4xl px-6 py-30">
          <h1 className="text-2xl font-semibold">
            Invalid application URL
          </h1>

          <Link
            href="/employer/applications"
            className="mt-4 inline-block underline"
          >
            Back to applications
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!application) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-4xl px-6 py-30">
          <h1 className="text-2xl font-semibold">
            Application not found
          </h1>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <Link
            href="/employer/applications"
            className="mt-4 inline-block underline"
          >
            Back to applications
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-6 py-30">

        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href={`/employer/jobs/${jobId}/applications`}
              className="text-sm text-neutral-500 hover:underline"
            >
              ← Back to applications
            </Link>

            <h1 className="mt-3 text-3xl font-semibold">
              {application.artist_name ||
                "Artist application"}
            </h1>

            <p className="mt-2 text-neutral-500">
              Applied for{" "}

              <span className="font-medium text-black">
                {application.job_title ||
                  application.application_title ||
                  `Job #${jobId}`}
              </span>
            </p>

            {application.application_code && (
              <p className="mt-1 text-sm text-neutral-400">
                {
                  application.application_code
                }
              </p>
            )}
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap items-center gap-2">

            <a
              href={`/api/employer/jobs/${jobId}/applications/${appId}/pdf`}
              className="rounded-2xl border px-4 py-2 text-sm transition hover:bg-neutral-50"
            >
              Download PDF
            </a>

            <select
              value={application.status}
              disabled={updating}
              onChange={(event) =>
                changeStatus(
                  event.target
                    .value as ApplicationStatus
                )
              }
              className="rounded-2xl border bg-white px-4 py-2 text-sm disabled:opacity-50"
            >
              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status ===
                    "under_review"
                      ? "Under review"
                      : status
                          .charAt(0)
                          .toUpperCase() +
                        status.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* APPLICATION */}

        <div className="rounded-3xl border bg-white p-6">

          <div className="flex flex-col gap-6 md:flex-row">

            {/* PHOTO */}

            {application.artist_picture && (
              <img
                src={
                  application.artist_picture
                }
                alt={
                  application.artist_name ||
                  "Applicant"
                }
                className="h-48 w-48 shrink-0 rounded-2xl object-cover"
              />
            )}

            {/* PERSONAL INFO */}

            <div className="flex-1">
              <SectionTitle>
                Personal information
              </SectionTitle>

              <div className="mt-4 space-y-2">
                <Row
                  label="Country"
                  value={
                    application.artist_country
                  }
                />

                <Row
                  label="Date of birth"
                  value={
                    application.artist_date_of_birth
                  }
                />

                <Row
                  label="Height"
                  value={
                    application.artist_height
                  }
                />

                <Row
                  label="Weight"
                  value={
                    application.artist_weight
                  }
                />

                <Row
                  label="Bust"
                  value={
                    application.artist_bust
                  }
                />

                <Row
                  label="Waist"
                  value={
                    application.artist_waist
                  }
                />

                <Row
                  label="Hips"
                  value={
                    application.artist_hips
                  }
                />

                <Row
                  label="Status"
                  value={
                    application.status ===
                    "under_review"
                      ? "Under review"
                      : application.status
                  }
                />
              </div>
            </div>
          </div>

          {/* EXPERIENCE */}

          {application.artist_experience && (
            <Section
              title="Experience"
              text={
                application.artist_experience
              }
            />
          )}

          {/* BIO */}

          {application.artist_biography && (
            <Section
              title="Biography"
              text={
                application.artist_biography
              }
            />
          )}

          {/* COVER MESSAGE */}

          {application.cover_message && (
            <Section
              title="Cover message"
              text={
                application.cover_message
              }
            />
          )}

          {/* PORTFOLIO */}

          {application.promo_url && (
            <div className="mt-8 border-t pt-6">
              <SectionTitle>
                Video / Portfolio
              </SectionTitle>

              <a
                href={
                  application.promo_url
                }
                target="_blank"
                rel="noreferrer"
                className="mt-3 block break-all underline"
              >
                {
                  application.promo_url
                }
              </a>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-lg font-semibold">
      {children}
    </h2>
  );
}

function Section({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="mt-8 border-t pt-6">
      <SectionTitle>
        {title}
      </SectionTitle>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
        {text}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode | null;
}) {
  if (!value) return null;

  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <span className="text-neutral-500">
        {label}
      </span>

      <span>{value}</span>
    </div>
  );
}