"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "../ds/Button";
import { Kicker, Sticker, Tabs, Tag } from "../ds/primitives";
import type { Job, Review } from "../../utils/Types";
import { DISCIPLINES, contractLabel, jobHref, salaryLabel } from "@/lib/jobFormat";
import ContractRow from "../vacancies/ContractRow";

/* ---------------- Hero ---------------- */

// Tile looks for the discipline band; values come from lib/jobFormat DISCIPLINES
const TILE_STYLE: Record<string, { cls: string; tilt: number }> = {
  dance: { cls: "bg-paper text-ink", tilt: -2 },
  vocal: { cls: "bg-ink text-paper", tilt: 1.5 },
  circus: { cls: "bg-pink text-ink", tilt: -1 },
  aerial: { cls: "bg-blue text-paper", tilt: 2 },
  music: { cls: "bg-paper text-ink", tilt: -1.5 },
  variety: { cls: "bg-orange text-ink", tilt: 1 },
  choreo: { cls: "bg-ink text-paper", tilt: -2.5 },
};

function SearchBar() {
  const router = useRouter();
  const [discipline, setDiscipline] = useState("");
  const [region, setRegion] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (discipline) qs.set("discipline", discipline);
    if (region) qs.set("location", region);
    router.push(`/vacancies${qs.toString() ? `?${qs}` : ""}`);
  };

  const field = "flex flex-1 flex-col border-[1.5px] border-ink bg-white px-5 py-3 -mr-[1.5px] max-md:-mb-[1.5px] max-md:mr-0";

  return (
    <form onSubmit={submit} className="mt-8 flex max-w-[640px] flex-col shadow-hard-pink md:flex-row">
      <label className={field}>
        <span className="label text-ink/60">Discipline</span>
        <select
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value)}
          className="mt-1 bg-transparent text-[15px] font-semibold outline-none cursor-pointer"
        >
          <option value="">Any</option>
          {DISCIPLINES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </label>
      <label className={field}>
        <span className="label text-ink/60">Region</span>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Worldwide"
          className="mt-1 bg-transparent text-[15px] font-semibold outline-none placeholder:text-ink"
        />
      </label>
      <button type="submit" className="border-[1.5px] border-ink bg-ink px-8 py-4 text-[12px] font-bold uppercase tracking-[0.12em] text-paper hover:bg-panel-2 cursor-pointer">
        Search →
      </button>
    </form>
  );
}

/** One photo, four colour passes (lime, pink, blue, orange). */
function Collage() {
  const passes = [
    { bg: "bg-lime", dot: "#9fcc00" },
    { bg: "bg-pink", dot: "#c92f83" },
    { bg: "bg-blue", dot: "#1f2bc4" },
    { bg: "bg-orange", dot: "#cf5212" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div className="grid aspect-[4/5] grid-cols-2 grid-rows-2 border-[1.5px] border-ink shadow-hard contrast-80">
        {passes.map((p, i) => (
          <div key={i} className={`halftone relative overflow-hidden ${p.bg}`} style={{ ["--dot" as string]: p.dot }}>
            <div
              className="absolute inset-[16%] bg-[url('/images/header-pic.webp')] bg-cover grayscale contrast-70 mix-blend-multiply"
              style={{ backgroundPosition: `${i % 2 ? "100%" : "0%"} ${i < 2 ? "0%" : "100%"}` }}
            />
          </div>
        ))}
      </div>

      <Sticker tone="lime" size={150} className="absolute -left-6 -top-10 max-sm:-left-2">
        New season 26/27!
      </Sticker>
    </div>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden border-b border-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pt-20">
        <div className="relative z-10 min-w-0">
          <Kicker>International contracts for performing artists</Kicker>
          <h1 className="font-display mt-8 text-[clamp(34px,10.4vw,190px)] lg:mr-[-40%] lg:text-[clamp(52px,9.6vw,190px)]">
            Find<br />your<br />contract.
          </h1>
          <p className="mt-10 max-w-md text-[17px] leading-relaxed">
            Verified jobs on ships, stages, resorts and tours worldwide, reviewed by the artists who already worked them.
          </p>
          <SearchBar />
        </div>
        <Collage />
      </div>
    </section>
  );
}

/* ---------------- Disciplines band ---------------- */

function useDisciplineCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      DISCIPLINES.map((d) =>
        fetch(`/api/jobs?discipline=${d.value}&pageSize=1`)
          .then((r) => (r.ok ? r.json() : { total: 0 }))
          .then((j) => [d.value, Number(j.total) || 0] as const)
          .catch(() => [d.value, 0] as const)
      )
    ).then((pairs) => !cancelled && setCounts(Object.fromEntries(pairs)));
    return () => {
      cancelled = true;
    };
  }, []);
  return counts;
}

function Disciplines() {
  const counts = useDisciplineCounts();
  return (
    <section className="halftone overflow-hidden border-b border-ink bg-lime" style={{ ["--dot" as string]: "#a9d900" }}>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-5 px-4 py-14">
        {DISCIPLINES.map((d) => (
          <Link
            key={d.value}
            href={`/vacancies?discipline=${d.value}`}
            className={`font-display relative border-[1.5px] border-ink px-6 py-4 text-[clamp(30px,6vw,72px)] shadow-hard transition-transform hover:-translate-y-1 ${TILE_STYLE[d.value].cls}`}
            style={{ transform: `rotate(${TILE_STYLE[d.value].tilt}deg)` }}
          >
            {d.label}
            <sup className="ml-1 align-top font-sans text-[14px] font-semibold tracking-normal">[{counts[d.value] ?? "—"}]</sup>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Open contracts ---------------- */

type Sort = "newest" | "fee";

function FeaturedCard({ job }: { job: Job }) {
  return (
    <Link href={jobHref(job)} className="group relative block min-w-0 border-[1.5px] border-ink bg-paper shadow-hard-pink sm:-rotate-1">
      <Tag tone="lime" className="absolute right-0 top-0 px-3 py-1.5 text-[10px]">Featured</Tag>
      <div className="px-5 pb-5 pt-6 sm:px-7">
        <p className="label text-ink/60">{[job.company_name, job.location].filter(Boolean).join(" · ")}</p>
        <h3 className="font-display mt-2 break-words text-[clamp(26px,3.4vw,40px)]">{job.title}</h3>
      </div>
      <dl className="grid grid-cols-3 border-t-[1.5px] border-ink">
        {[
          ["Length", contractLabel(job)],
          ["Fee / mo", salaryLabel(job) ?? "On request"],
          ["Location", job.location || "—"],
        ].map(([k, v], i) => (
          <div key={k} className={`min-w-0 px-4 py-4 sm:px-7 ${i < 2 ? "border-r-[1.5px] border-ink" : ""}`}>
            <dt className="label text-ink/60">{k}</dt>
            <dd className="mt-1 truncate text-[16px] font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between bg-ink px-7 py-4 text-[12px] font-bold uppercase tracking-[0.1em] text-paper">
        View contract <span>→</span>
      </div>
    </Link>
  );
}

function OpenContracts() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    fetch("/api/jobs?pageSize=12")
      .then((r) => (r.ok ? r.json() : { jobs: [] }))
      .then((d) => setJobs(d.jobs ?? []))
      .catch(() => setJobs([]));
  }, []);

  const sorted = useMemo(() => {
    if (!jobs) return [];
    if (sort === "newest") return jobs;
    const fee = (j: Job) => Number(j.salary_to ?? j.salary_from ?? 0);
    return [...jobs].sort((a, b) => fee(b) - fee(a));
  }, [jobs, sort]);

  const newestIds = useMemo(() => new Set((jobs ?? []).slice(0, 2).map((j) => j.id)), [jobs]);
  const [featured, ...rest] = sorted;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(40px,10vw,128px)] lg:text-[clamp(40px,7.4vw,128px)]">
            Open<br />contracts
          </h2>
          <Tabs<Sort>
            value={sort}
            onChange={setSort}
            options={[
              { value: "newest", label: "Newest" },
              { value: "fee", label: "Highest fee" },
            ]}
          />
        </div>

        {jobs === null ? (
          <p className="label mt-12 text-ink/50">Loading contracts…</p>
        ) : jobs.length === 0 ? (
          <p className="mt-12 text-ink/60">No open contracts right now. Check back soon.</p>
        ) : (
          <div className="mt-14 grid grid-cols-[minmax(0,1fr)] items-start gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
            {featured && <FeaturedCard job={featured} />}
            <div>
              <ul className="border-t-[1.5px] border-ink">
                {rest.slice(0, 5).map((job) => (
                  <ContractRow key={job.id} job={job} isNew={newestIds.has(job.id)} />
                ))}
              </ul>
              <Button href="/vacancies" variant="lime" arrow className="mt-8">All contracts</Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Reviews ---------------- */

function ExperienceSection() {
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    fetch("/api/get_reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Review[]) => setReview(Array.isArray(rows) && rows.length ? rows[0] : null))
      .catch(() => setReview(null));
  }, []);

  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative min-w-0">
          <span aria-hidden className="font-display text-outline-pink pointer-events-none block select-none text-[200px] leading-[0.6]">“</span>
          <h2 className="font-display -mt-6 text-[clamp(32px,9.2vw,140px)] lg:text-[clamp(40px,6.4vw,80px)]">
            Experience<br />
            <span className="text-outline-paper">not</span><br />
            adver-<br />tising.
          </h2>
          <p className="mt-10 max-w-lg text-[18px] leading-relaxed text-paper/85">
            An open base of reviews about companies, ships and venues, written by the artists who worked there. Search it
            before you sign.
          </p>
          <Button href="/reviews" variant="lime" arrow className="mt-10 shadow-none hover:shadow-none">Search reviews</Button>
        </div>

        <div className="relative border-[1.5px] border-paper/70 bg-ink shadow-hard-lime">
          <Tag tone="lime" className="absolute -left-2 -top-4 z-10 -rotate-2 px-4 py-2 text-[12px] italic">Meanwhile, backstage…</Tag>
          <Tag tone="pink" className="absolute right-0 top-0 z-10 px-3 py-2">Artist review</Tag>
          <div className="border-b border-paper/30 px-8 py-6">
            <p className="font-display text-[clamp(22px,2.6vw,34px)]">{review ? review.company_name : "Your venue here"}</p>
            <p className="label mt-2 text-paper/60">
              {review ? [review.position, review.place_of_work].filter(Boolean).join(" · ") : "Season · discipline"}
            </p>
          </div>
          <div className="p-8">
            <div className="relative border-[1.5px] border-ink bg-paper p-6 text-ink shadow-[6px_6px_0_0_var(--color-pink)]">
              <p className="text-[17px] font-medium leading-snug">
                {review
                  ? `“${review.content}”`
                  : "Worked a contract? Tell other artists how it really was: pay, housing, hours, and whether you would go back."}
              </p>
              <span aria-hidden className="absolute -bottom-4 left-8 h-0 w-0 border-l-[14px] border-r-[6px] border-t-[16px] border-l-transparent border-r-transparent border-t-paper" />
            </div>
            <p className="label mt-8 text-paper/60">
              {review ? `— ${review.artist_name}` : <Link href="/reviews" className="text-lime">Write the first review →</Link>}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Three steps ---------------- */

const STEPS = [
  { n: "01", title: "Build your profile", photo: "photo — headshot session", text: "Showreel, photos, skills and measurements in one link, the format casting directors actually ask for." },
  { n: "02", title: "Apply direct", photo: "photo — audition / rehearsal", text: "Send your profile to verified employers in one tap. Track every application in one place." },
  { n: "03", title: "Share experience", photo: "photo — curtain call", text: "Review the companies and venues you worked with, and read what others say before you sign." },
];

function ThreeSteps() {
  return (
    <section className="halftone border-y border-ink bg-blue text-paper" style={{ ["--dot" as string]: "#4a58ff" }}>
      <div className="mx-auto max-w-7xl px-4 py-24">
        <h2 className="font-display text-[clamp(34px,9vw,104px)] lg:text-[clamp(34px,6.4vw,104px)]">
          Three steps<br />to the <span className="text-outline-paper">stage</span>
        </h2>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="border-[1.5px] border-ink bg-paper text-ink shadow-hard md:[margin-top:var(--offset)]" style={{ ["--offset" as string]: `${i * 56}px` }}>
              <div className="relative h-44 bg-panel">
                <p className="font-display text-outline-paper absolute left-5 top-4 text-[80px]">{s.n}</p>
                <p className="label absolute bottom-3 left-5 text-paper/50">[{s.photo}]</p>
              </div>
              <div className="p-7">
                <p className="font-display text-[clamp(20px,2.2vw,28px)]">{s.title}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Employer CTA ---------------- */

function EmployerCta() {
  return (
    <section className="relative overflow-hidden bg-[#1a0a10]">
      <div className="halftone absolute inset-y-0 left-0 w-full bg-pink lg:w-1/2" style={{ ["--dot" as string]: "#c22f80" }} />
      {/* <p className="label absolute right-6 top-8 hidden text-paper/60 lg:block">[photo — full cast on stage, backlit]</p> */}
      <div className="relative mx-auto max-w-7xl px-4 py-24">
        <h2 className="font-display text-shadow-hard text-[clamp(44px,12vw,170px)] text-paper lg:text-[clamp(44px,10vw,170px)]">
          Cast<br />your next<br /><span className="text-lime">show.</span>
        </h2>
        <div className="relative mt-12 lg:-mt-40 lg:ml-auto lg:w-[42%]">
          <Sticker tone="lime" size={150} className="absolute -left-36 top-[45%] z-10 max-lg:hidden">Now casting!</Sticker>
          <div className="border-[1.5px] border-ink bg-paper p-8 text-ink shadow-hard">
            <p className="label">For venues, producers &amp; agencies</p>
            <p className="mt-4 text-[18px] leading-snug">
              Post a contract and receive complete artist profiles (showreel, photos, skills) from people who want exactly this job.
            </p>
            <Button href="/employer/register" variant="ink" arrow className="mt-8 w-full">Post a contract</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Disciplines />
      <OpenContracts />
      <ExperienceSection />
      <ThreeSteps />
      <EmployerCta />
    </>
  );
}
