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
        <div className="mx-auto max-w-5xl px-4 py-14">
          Loading…
        </div>
      </MainLayout>
    );
  }

  if (invalidParams) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h1 className="font-display text-[clamp(34px,5vw,72px)]">
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
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h1 className="font-display text-[clamp(34px,5vw,72px)]">
            Application not found
          </h1>

          {error && (
            <p className="mt-3 border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">
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
      <div className="mx-auto max-w-5xl px-4 py-14">

        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href={`/employer/jobs/${jobId}/applications`}
              className="text-sm text-ink/60 hover:underline"
            >
              ← Back to applications
            </Link>

            <h1 className="mt-3 font-display text-[clamp(34px,5vw,72px)]">
              {application.artist_name ||
                "Artist application"}
            </h1>

            <p className="mt-2 text-ink/60">
              Applied for{" "}

              <span className="font-medium text-black">
                {application.job_title ||
                  application.application_title ||
                  `Job #${jobId}`}
              </span>
            </p>

            {application.application_code && (
              <p className="mt-1 text-sm text-ink/50">
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
              className="inline-flex items-center justify-center gap-2 border-[1.5px] border-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-ink hover:text-paper disabled:opacity-50 cursor-pointer"
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
              className="inline-flex items-center justify-center gap-2 border-[1.5px] border-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-ink hover:text-paper disabled:opacity-50 cursor-pointer"
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
          <div className="mb-6 border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">
            {error}
          </div>
        )}

        {/* APPLICATION */}

        <div className="border-[1.5px] border-ink bg-white p-7 shadow-[4px_4px_0_0_var(--color-ink)]">

          <div className="flex flex-col gap-6 md:flex-row">

            {/* PHOTO */}

            {application.artist_picture && (
              // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URLs, no next/image domain config
              <img
                src={
                  application.artist_picture
                }
                alt={
                  application.artist_name ||
                  "Applicant"
                }
                className="h-48 w-48 shrink-0 object-cover border-[1.5px] border-ink"
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
            <div className="mt-8 border-t-[1.5px] border-ink pt-6">
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
    <h2 className="font-display text-[22px]">
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
    <div className="mt-8 border-t-[1.5px] border-ink pt-6">
      <SectionTitle>
        {title}
      </SectionTitle>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/80">
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
      <span className="text-ink/60">
        {label}
      </span>

      <span>{value}</span>
    </div>
  );
}