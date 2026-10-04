"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { Button } from "../ds/Button";
import { Tag } from "../ds/primitives";
import ApplyModal from "./ApplyModal";
import { contractLabel, disciplineLabel, salaryLabel } from "@/lib/jobFormat";
import { fitDisplaySize } from "@/lib/fitDisplay";
import type { Job } from "@/utils/Types";

type JobDetail = Job & {
  created_at: string | null;
  employer: { verified: boolean; logo_url: string | null; country: string | null; website: string | null } | null;
};

/** Splits the free-text description into a lead paragraph and the remaining paragraphs. */
function splitDescription(text = "") {
  const blocks = text
    .split(/\n+/)
    .map((l) => l.replace(/^\s*([-•*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
  return { lead: blocks[0] ?? "", details: blocks.slice(1) };
}

export default function ContractDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setJob(d.job);
          setState("ok");
        } else setState("missing");
      })
      .catch(() => setState("missing"));
  }, [id]);

  if (state === "loading") return <p className="label mx-auto max-w-7xl px-4 py-24 text-ink/50">Loading contract…</p>;

  if (state === "missing" || !job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24">
        <p className="font-display text-[clamp(36px,7vw,96px)]">Contract<br />not found.</p>
        <p className="mt-6 text-ink/70">It may have closed or been taken down.</p>
        <Button href="/vacancies" arrow className="mt-8">All contracts</Button>
      </div>
    );
  }

  const { lead, details } = splitDescription(job.description);
  const posted = job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

  const stats = [
    { label: "Fee / month", value: salaryLabel(job) ?? "On request" },
    { label: "Length", value: contractLabel(job) },
    { label: "Location", value: job.location || "—" },
    { label: "Employer", value: job.company_name || "—" },
    { label: "Posted", value: posted ?? "—" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-8">
          <Link href="/vacancies" className="label hover:underline">← All contracts</Link>

          <div className="relative mt-10">
            <div className="relative z-10 min-w-0">
              <div className="flex flex-wrap gap-2">
                {job.employer?.verified && <Tag tone="lime" className="border-[1.5px] border-ink px-3 py-2 text-[10px]">Verified employer</Tag>}
                {disciplineLabel(job.discipline) && <Tag tone="ink" className="border-[1.5px] border-ink px-3 py-2 text-[10px]">{disciplineLabel(job.discipline)}</Tag>}
                {(job.contract_months || job.contract_type) && <Tag tone="outline" className="border-[1.5px] px-3 py-2 text-[10px]">{contractLabel(job)}</Tag>}
              </div>
              <h1 className="font-display mt-8" style={{ fontSize: fitDisplaySize(job.title, 1100, 190) }}>
                {job.title}
              </h1>
              <p className="mt-10 max-w-xl text-[clamp(18px,1.8vw,24px)] leading-snug">
                {[job.company_name, job.location].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {user ? (
                  <Button onClick={() => setApplyOpen(true)} arrow>Apply with profile</Button>
                ) : (
                  <Button href="/login" arrow>Sign in to apply</Button>
                )}
                {posted && <span className="text-[14px] text-ink/60">Posted {posted}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-y-[1.5px] border-ink bg-lime">
        <dl className="grid grid-cols-2 md:grid-cols-5">
          {stats.map((s, i) => (
            <div key={s.label} className={`min-w-0 border-ink px-6 py-6 max-md:border-b ${i < stats.length - 1 ? "md:border-r" : ""} ${i % 2 === 0 ? "max-md:border-r" : ""}`}>
              <dt className="label">{s.label}</dt>
              <dd className="font-display mt-3 break-words text-[clamp(18px,1.8vw,26px)] leading-[1]">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Body + sidebar */}
      <section className="mx-auto grid max-w-7xl items-start gap-14 px-4 py-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          {lead && <p className={`text-[clamp(20px,2vw,30px)] leading-snug ${user ? "" : "line-clamp-3"}`}>{lead}</p>}

          {/* Full contract text is for signed-in artists, as on the old vacancies page */}
          {!user && (
            <div className="mt-8 border-[1.5px] border-ink bg-white p-6 shadow-hard-sm">
              <p className="font-bold">Sign in to read the full contract and apply.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button href="/login" variant="ink" arrow>Sign in</Button>
                <Button href="/signup" variant="secondary">Create profile</Button>
              </div>
            </div>
          )}

          {user && details.length > 0 && (
            <>
              <h2 className="font-display mt-16 text-[clamp(28px,3.4vw,48px)]">Details</h2>
              <div className="mt-5 space-y-4 border-t-2 border-ink pt-5 text-[19px] leading-relaxed">
                {details.map((d, i) => (
                  <p key={i}>{d}</p>
                ))}
              </div>
            </>
          )}

          <div className="mt-16 flex flex-wrap gap-4">
            {user ? (
              <Button onClick={() => setApplyOpen(true)} arrow>Apply with profile</Button>
            ) : (
              <Button href="/signup" arrow>Create profile to apply</Button>
            )}
            <Button href="/vacancies" variant="secondary">More contracts</Button>
          </div>
        </div>

        <aside className="sticky top-20 bg-ink text-paper shadow-hard-pink">
          <div className="border-b border-paper/15 p-7">
            <p className="label text-paper/60">Reviews of this employer</p>
            <p className="font-display mt-3 text-[34px]">{job.company_name}</p>
          </div>
          <div className="p-7">
            <span aria-hidden className="font-display text-outline-pink block text-[72px] leading-[0.6]">“</span>
            <p className="mt-4 text-[17px] leading-snug">
              No reviews of this employer yet. Worked with them before? Tell the next artist how it really was.
            </p>
            <Button href="/reviews" variant="lime" arrow className="mt-8 w-full shadow-none hover:shadow-none">All reviews</Button>
          </div>
        </aside>
      </section>

      <ApplyModal open={applyOpen} jobId={job.id} jobTitle={job.title} onClose={() => setApplyOpen(false)} />
    </>
  );
}
