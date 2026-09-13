"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmployerSession } from "./useEmployerSession";

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
  const { isLoading, isLogged } = useEmployerSession();
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
      } catch (err: any) {
        setError(err.message || "Error");
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
    } catch (err: any) {
      setError(err.message || "Error");
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
    return <div className="max-w-4xl mx-auto p-6 pt-30">Loading…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-30">
      <h1 className="text-2xl font-semibold">Applications{jobTitle ? ` — ${jobTitle}` : ""}</h1>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <div className="mt-6 space-y-3">
        {applications.length === 0 && (
          <p className="text-sm text-neutral-500">No applications yet for this job.</p>
        )}

        {applications.map((app) => {
          const expanded = expandedId === app.id;
          const applicantAge = age(app.artist_date_of_birth);
          return (
            <div key={app.id} className={`${app.status === "approved" && "border-green-200"} ${app.status === "rejected" &&  "border-red-600"}
              border-b-3 border p-4 rounded-2xl bg-white/80 shadow-none hover:shadow-lg transition-shadow duration-300`}>
              <div className="flex items-center justify-between gap-4">
                <button
                  className="hover:cursor-pointer flex items-center gap-4 text-left flex-1"
                  onClick={() => setExpandedId(expanded ? null : app.id)}
                >
                  {app.artist_picture && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.artist_picture}
                      alt={app.artist_name || "Applicant"}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  )}
                  <div>
                    <div className="font-medium">{app.artist_name}</div>
                    <div className="text-xs text-neutral-500">
                      {app.application_code} · {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-neutral-500">
                      From {app.artist_country}
                    </div>
                    <div>
                      {!expanded ? (
                        <p className="text-sm text-neutral-500">
                          Click to see more
                        </p>
                      ) : (
                        <p className="text-sm text-neutral-500">
                          Click to hide
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                <a
                  href={`/api/employer/jobs/${jobId}/applications/${app.id}/pdf`}
                  className="rounded-xl border px-3 py-2 text-sm transition hover:bg-neutral-100"
                >
                  Download PDF
                </a>

                <select
                  className="rounded-xl border p-2 text-sm bg-white"
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
                <div className="mt-4 pt-4 border-t grid gap-2 text-sm">
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
                          {app.promo_url}
                        </a>
                      }
                    />
                  )}
                  {app.cover_message && <Row label="Cover message" value={app.cover_message} />}

                  {app.images?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-neutral-500 mb-2">Photos</div>
                      <div className="flex gap-2 flex-wrap">
                        {app.images.map((img) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={img.public_id}
                            src={img.secure_url}
                            alt=""
                            className="w-24 h-24 object-cover rounded-xl border"
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
      <div className="text-neutral-500">{label}</div>
      <div>{value}</div>
    </div>
  );
}
