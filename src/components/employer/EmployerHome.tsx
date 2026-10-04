"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { Button } from "../ds/Button";
import { Tag } from "../ds/primitives";

type EmployerJob = {
  id: number;
  title: string;
  location: string | null;
  contract_type?: string | null;
  status: "pending" | "approved" | "rejected" | "closed";
  is_active: number;
};

type EmployerApplication = {
  id: number;
  application_code: string | null;
  job_id: number;
  artist_name: string;
  artist_picture: string | null;
  status: "pending" | "under_review" | "approved" | "rejected";
  job_title: string;
};

function jobStatus(job: EmployerJob): { label: string; tone: "lime" | "outline" | "grey" | "pink" } {
  if (job.status === "approved" && job.is_active === 1) return { label: "Active", tone: "lime" };
  if (job.status === "pending") return { label: "Pending", tone: "outline" };
  if (job.status === "rejected") return { label: "Rejected", tone: "pink" };
  return { label: "Closed", tone: "grey" };
}

const APP_STATUS: Record<EmployerApplication["status"], { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "border border-paper text-paper" },
  under_review: { label: "Under review", cls: "bg-blue text-paper" },
  approved: { label: "Approved", cls: "bg-lime text-ink" },
  rejected: { label: "Rejected", cls: "bg-pink text-ink" },
};

/** Employer dashboard: stats, job offers, latest applications and company card. */
export default function EmployerHome() {
  const router = useRouter();
  const { employer, isLoading, isLogged } = useEmployerAuth();
  const [jobs, setJobs] = useState<EmployerJob[] | null>(null);
  const [apps, setApps] = useState<EmployerApplication[] | null>(null);

  useEffect(() => {
    if (!isLoading && !isLogged) router.replace("/employer/login");
  }, [isLoading, isLogged, router]);

  useEffect(() => {
    if (!employer) return;
    fetch("/api/employer/jobs", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .catch(() => setJobs([]));
    fetch("/api/employer/applications", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setApps(d.applications ?? []))
      .catch(() => setApps([]));
  }, [employer]);

  const appsPerJob = useMemo(() => {
    const m = new Map<number, number>();
    (apps ?? []).forEach((a) => m.set(a.job_id, (m.get(a.job_id) ?? 0) + 1));
    return m;
  }, [apps]);

  if (!employer) return null;

  const count = (s: EmployerApplication["status"]) => (apps ?? []).filter((a) => a.status === s).length;
  const loading = jobs === null || apps === null;
  const stats = [
    { label: "Active offers", value: (jobs ?? []).filter((j) => j.status === "approved" && j.is_active === 1).length },
    { label: "Applications", value: (apps ?? []).length },
    { label: "Under review", value: count("under_review") },
    { label: "Approved", value: count("approved") },
    { label: "Rejected", value: count("rejected") },
  ];
  const newApps = count("pending");
  const firstName = (employer.contact_name || employer.company_name || "").split(" ")[0];

  const contactRows = [
    ["Person", employer.contact_name],
    ["Email", employer.email],
    ["Phone", employer.phone],
    ["Website", employer.website],
    ["Instagram", employer.instagram],
  ] as const;

  return (
    <>
      {/* Welcome */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-14">
        <p className="label">{["Employer", employer.company_name, employer.country].filter(Boolean).join(" · ")}</p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
          <h1 className="font-display text-[clamp(40px,10vw,150px)] lg:text-[clamp(44px,8.4vw,150px)]">
            Welcome<br />back, <span className="text-outline-ink">{firstName}.</span>
          </h1>
          <Button href="/employer/jobs/new">+ New job offer</Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y-[1.5px] border-ink bg-lime">
        <dl className="grid grid-cols-2 md:grid-cols-5">
          {stats.map((s, i) => (
            <div key={s.label} className={`border-ink px-6 py-6 max-md:border-b ${i < 4 ? "md:border-r" : ""} ${i % 2 === 0 ? "max-md:border-r" : ""}`}>
              <dt className="label">{s.label}</dt>
              <dd className="font-display mt-4 text-[clamp(44px,5vw,80px)]">{loading ? "–" : s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Pro banner */}
      <section className="halftone border-b-[1.5px] border-ink bg-pink" style={{ ["--dot" as string]: "#c22f80" }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 py-6">
          <span className="label border-[1.5px] border-ink bg-paper px-3 py-2">Free plan</span>
          <p className="font-display flex-1 text-[clamp(18px,2.2vw,32px)]">Find artists &amp; invite them yourself with Pro</p>
          <div className="flex gap-3">
            <Button href="/employer/artists" variant="paper">Preview database</Button>
            <Button href="/pricing" variant="ink" arrow>Go pro</Button>
          </div>
        </div>
      </section>

      {/* Job offers + applications */}
      <section className="mx-auto grid max-w-7xl items-start gap-14 px-4 py-20 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <div className="flex items-end justify-between border-b-2 border-ink pb-4">
            <h2 className="font-display text-[clamp(32px,4.4vw,64px)]">Job offers</h2>
            <Link href="/employer/jobs" className="label hover:underline">View all →</Link>
          </div>
          {jobs === null ? (
            <p className="label mt-6 text-ink/50">Loading…</p>
          ) : jobs.length === 0 ? (
            <div className="mt-6">
              <p className="text-ink/70">No job offers yet.</p>
              <Button href="/employer/jobs/new" variant="lime" arrow className="mt-5">Post your first offer</Button>
            </div>
          ) : (
            <ul>
              {jobs.slice(0, 5).map((job) => {
                const st = jobStatus(job);
                const n = appsPerJob.get(job.id) ?? 0;
                return (
                  <li key={job.id}>
                    <Link href={`/employer/jobs/${job.id}/applications`} className="group flex items-center gap-5 border-b border-ink py-5">
                      <div className="h-16 w-20 shrink-0 bg-panel-2" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display truncate text-[clamp(18px,2vw,28px)]">{job.title}</p>
                        <p className="mt-1 truncate text-[14px] text-ink/60">{job.location}</p>
                      </div>
                      <span className="hidden w-32 text-[14px] sm:block">{n ? `${n} application${n === 1 ? "" : "s"}` : "—"}</span>
                      <Tag tone={st.tone} className="hidden w-24 text-center sm:inline-block">{st.label}</Tag>
                      <span className="grid h-12 w-12 shrink-0 place-items-center border-[1.5px] border-ink group-hover:bg-lime">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="bg-ink text-paper shadow-hard-lime">
          <div className="flex items-start justify-between border-b border-paper/15 p-7">
            <h2 className="font-display text-[clamp(28px,3vw,44px)]">Applications</h2>
            {newApps > 0 && <span className="bg-pink px-2 py-1 text-[11px] font-bold leading-tight text-ink">{newApps}<br />new</span>}
          </div>
          {apps === null ? (
            <p className="label p-7 text-paper/50">Loading…</p>
          ) : apps.length === 0 ? (
            <p className="p-7 text-paper/70">No applications yet. They will show up here as artists apply.</p>
          ) : (
            <ul>
              {apps.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <Link href={`/employer/jobs/${a.job_id}/applications/${a.id}`} className="flex gap-4 border-b border-paper/15 px-7 py-5 hover:bg-panel-2">
                    {a.artist_picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.artist_picture} alt="" className="h-20 w-16 shrink-0 object-cover grayscale" />
                    ) : (
                      <div className="h-20 w-16 shrink-0 bg-placeholder" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[18px] font-bold">{a.artist_name}</p>
                      <p className="mt-0.5 truncate text-[13px] text-paper/60">
                        {[a.job_title, a.application_code].filter(Boolean).join(" · ")}
                      </p>
                      <span className={`mt-2 inline-block px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em] ${APP_STATUS[a.status].cls}`}>
                        {APP_STATUS[a.status].label}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="p-7">
            <Link href="/employer/applications" className="flex items-center justify-between bg-paper px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.1em] text-ink hover:bg-lime">
              All applications <span>→</span>
            </Link>
          </div>
        </aside>
      </section>

      {/* Company band */}
      <section className="border-t border-ink bg-stone">
        <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-20 md:grid-cols-3">
          <div className="border-[1.5px] border-ink bg-paper shadow-hard">
            {employer.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={employer.logo_url} alt={employer.company_name} className="h-52 w-full object-cover" />
            ) : (
              <div className="relative h-52 bg-panel">
                <p className="label absolute bottom-3 left-5 text-paper/50">[company logo / venue photo]</p>
              </div>
            )}
            <div className="p-7">
              <p className="font-display text-[clamp(24px,2.6vw,36px)]">{employer.company_name}</p>
              {employer.country && <p className="mt-1 text-ink/60">{employer.country}</p>}
              <Button href="/employer/profile" variant="ink" arrow className="mt-6 w-full">Edit profile</Button>
            </div>
          </div>

          <div className="border-[1.5px] border-ink bg-paper p-7 shadow-hard">
            <p className="font-display border-b-2 border-ink pb-4 text-[clamp(24px,2.6vw,36px)]">Contact</p>
            <dl>
              {contactRows.map(([k, v]) => (
                <div key={k} className="flex gap-4 border-b border-ink py-3">
                  <dt className="label w-24 shrink-0 pt-1 text-ink/60">{k}</dt>
                  <dd className="min-w-0 truncate text-[15px]">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={`border-[1.5px] border-ink p-7 shadow-hard ${employer.status === "verified" ? "bg-blue text-paper" : employer.status === "blocked" ? "bg-pink text-ink" : "bg-paper text-ink"}`}>
            <p className="label">Account status</p>
            <p className="font-display mt-4 text-[clamp(34px,4.4vw,64px)]">{employer.status}</p>
            {employer.status === "verified" ? (
              <>
                <Tag tone="lime" className="mt-4 px-3 py-2 text-[10px]">✓ Company verified</Tag>
                <p className="mt-4 text-[15px] leading-relaxed">Your offers show the verified mark next to your company name.</p>
              </>
            ) : employer.status === "pending" ? (
              <p className="mt-4 text-[15px] leading-relaxed">We are checking your company. Offers go live once you are verified.</p>
            ) : (
              <p className="mt-4 text-[15px] leading-relaxed">This account is blocked. Contact us if you think this is a mistake.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
