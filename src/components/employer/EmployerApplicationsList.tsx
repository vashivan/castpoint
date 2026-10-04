"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmployerAuth } from "@/context/EmployerAuthContext";

type ImageItem = { secure_url: string; public_id: string };

type Application = {
  id: number;
  job_id: number;
  application_code: string;
  status: string;
  created_at: string;
  artist_email: string;
  artist_name: string | null;
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
  cover_message: string | null;
  promo_url: string | null;
  images: ImageItem[];
};

const STATUS_OPTIONS = ["pending", "under_review", "approved", "rejected"];

export default function EmployerApplicationsList({ jobId }: { jobId: number }) {
  const router = useRouter();
  const { isLoading, isLogged } = useEmployerAuth();
  const [jobTitle, setJobTitle] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLogged) router.replace("/employer/login");
  }, [isLoading, isLogged, router]);

  useEffect(() => {
    if (!isLogged) return;
    (async () => {
      try {
        const res = await fetch(`/api/employer/jobs/${jobId}/applications`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load applications");
        setJobTitle(data.job?.title || "");
        setApplications(data.applications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLogged, jobId]);

  async function changeStatus(appId: number, status: string) {
    setUpdatingId(appId);
    setError(null);
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update status");
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setUpdatingId(null);
    }
  }

  function age(dob: string | null) {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  if (isLoading || !isLogged || loading) {
    return <div className="max-w-5xl mx-auto px-4 py-14">Loading…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <h1 className="font-display text-[clamp(34px,5vw,72px)]">Applications{jobTitle ? ` — ${jobTitle}` : ""}</h1>

      {error && (
        <div className="mt-4 border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">{error}</div>
      )}

      <div className="mt-6 space-y-3">
        {applications.length === 0 && (
          <p className="text-sm text-ink/60">No applications yet for this job.</p>
        )}

        {applications.map((app) => {
          const expanded = expandedId === app.id;
          const applicantAge = age(app.artist_date_of_birth);
          return (
            <div key={app.id} className={`border-[1.5px] border-ink bg-white p-4 transition-shadow hover:shadow-[4px_4px_0_0_var(--color-ink)] ${
                app.status === "approved" ? "border-l-8 border-l-lime" : app.status === "rejected" ? "border-l-8 border-l-pink" : ""
              }`}>
              <div className="flex items-left justify-between gap-4 flex-col">
                <button
                  className="hover:cursor-pointer flex items-center gap-4 text-left flex-1"
                  onClick={() => setExpandedId(expanded ? null : app.id)}
                >
                  {app.artist_picture && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.artist_picture}
                      alt={app.artist_name || "Applicant"}
                      className="w-12 h-12 object-cover border-[1.5px] border-ink"
                    />
                  )}
                  <div>
                    <div className="font-medium">{app.artist_name}</div>
                    <div className="text-xs text-ink/60">
                      {app.application_code} · {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-ink/60">
                      From {app.artist_country}
                    </div>
                    <div>
                      {!expanded ? (
                        <p className="text-sm text-ink/60">
                          Click to see more
                        </p>
                      ) : (
                        <p className="text-sm text-ink/60">
                          Click to hide
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                <a
                  href={`/api/employer/jobs/${jobId}/applications/${app.id}/pdf`}
                  className="inline-flex items-center justify-center gap-2 border-[1.5px] border-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-ink hover:text-paper disabled:opacity-50 cursor-pointer"
                >
                  Download PDF
                </a>

                <select
                  className="border-[1.5px] border-ink bg-white px-3 py-2 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
                  value={app.status}
                  disabled={updatingId === app.id}
                  onChange={(e) => changeStatus(app.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {expanded && (
                <div className="mt-4 pt-4 border-t border-ink grid gap-2 text-[14px]">
                  {applicantAge != null && <Row label="Age" value={String(applicantAge)} />}
                  <Row label="Country" value={app.artist_country} />
                  <Row label="Height" value={app.artist_height} />
                  <Row label="Weight" value={app.artist_weight} />
                  <Row label="Bust / Waist / Hips" value={[app.artist_bust, app.artist_waist, app.artist_hips].filter(Boolean).join(" / ") || null} />
                  <Row label="Experience" value={app.artist_experience} />
                  <Row label="Biography" value={app.artist_biography} />
                  <Row label="Phone" value={<a href={`tel:${app.artist_phone}`}>
                    <p className="hover:underline underline">{app.artist_phone}</p></a>} />
                  <Row label="Email" value={<a href={`mailto:${app.artist_email}`}>
                    <p className="hover:underline underline">{app.artist_email}</p></a>} />
                  {app.artist_instagram && (
                    <Row
                      label="Instagram"
                      value={
                        <a
                          className="underline"
                          href={
                            app.artist_instagram.startsWith("http")
                              ? app.artist_instagram
                              : `https://instagram.com/${app.artist_instagram.replace("@", "")}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {app.artist_instagram}
                        </a>
                      }
                    />
                  )}
                  {app.promo_url && (
                    <Row
                      label="Video / Portfolio"
                      value={
                        <a className="underline" href={app.promo_url} target="_blank" rel="noreferrer">
                          link to promo
                        </a>
                      }
                    />
                  )}
                  {app.cover_message && <Row label="Cover message" value={app.cover_message} />}

                  {app.images?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-ink/60 mb-2">Photos</div>
                      <div className="flex gap-2 flex-wrap">
                        {app.images.map((img) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={img.public_id}
                            src={img.secure_url}
                            alt=""
                            className="w-24 h-24 object-cover border-[1.5px] border-ink"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
      <div className="text-ink/60">{label}</div>
      <div>{value}</div>
    </div>
  );
}
