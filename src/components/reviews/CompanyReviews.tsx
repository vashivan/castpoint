"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { Button } from "../ds/Button";
import { Sticker, Tabs } from "../ds/primitives";
import WriteReviewModal from "./WriteReviewModal";
import { useReviews } from "./useReviews";
import { fitDisplaySize } from "@/lib/fitDisplay";

type Sort = "newest" | "oldest";

/** All reviews of one company, grouped from the review base. */
export default function CompanyReviews({ name }: { name: string }) {
  const { user } = useAuth();
  const { reviews, companies, reload } = useReviews();
  const [sort, setSort] = useState<Sort>("newest");
  const [writeOpen, setWriteOpen] = useState(false);

  const company = useMemo(() => companies.find((c) => c.name.toLowerCase() === name.trim().toLowerCase()), [companies, name]);
  const list = useMemo(() => {
    const items = company?.reviews ?? [];
    return sort === "newest" ? items : [...items].reverse();
  }, [company, sort]);

  const n = company?.reviews.length ?? 0;
  const firstYear = company ? new Date(company.reviews[company.reviews.length - 1].created_at).getFullYear() : null;

  return (
    <>
      {/* Hero */}
      <section className="grid border-b-[1.5px] border-ink lg:grid-cols-2">
        <div className="relative px-4 pb-14 pt-8 lg:pl-[max(1rem,calc((100vw-80rem)/2+1rem))]">
          <Link href="/reviews" className="label hover:underline">← All reviews</Link>
          <p className="label mt-10">{[company?.places[0], `${n} review${n === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}</p>
          <h1 className="font-display text-outline-ink relative z-10 mt-6" style={{ fontSize: fitDisplaySize(name, 600, 150) }}>
            {name}
          </h1>
          <div className="mt-12 flex flex-wrap gap-4">
            <Button onClick={() => (user ? setWriteOpen(true) : (window.location.href = "/login"))}>Write a review <span>+</span></Button>
            <Button href={`/vacancies?q=${encodeURIComponent(name)}`} variant="secondary" arrow>Open contracts</Button>
          </div>
        </div>
        <div className="halftone relative min-h-[360px] bg-blue" style={{ ["--dot" as string]: "#1f2bc4" }}>
          <div className="absolute inset-y-[12%] left-[12%] right-[6%] bg-navy" />
          <Sticker tone="lime" size={170} className="absolute -left-14 top-10 z-20 max-lg:left-4">
            {n} {n === 1 ? "review" : "reviews"}
          </Sticker>
          <p className="label absolute bottom-4 right-6 text-paper/60">[photo — the ship / venue]</p>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto grid max-w-7xl items-start gap-14 px-4 py-16 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-ink pb-4">
            <h2 className="font-display text-[clamp(36px,5vw,72px)]">Reviews</h2>
            <Tabs<Sort> value={sort} onChange={setSort} options={[{ value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }]} />
          </div>

          {!user ? (
            <div className="mt-8 border-[1.5px] border-ink bg-white p-8 shadow-hard">
              <p className="font-display text-[28px]">Sign in to read reviews.</p>
              <Button href="/login" variant="ink" arrow className="mt-5">Sign in</Button>
            </div>
          ) : reviews === null ? (
            <p className="label mt-8 text-ink/50">Loading…</p>
          ) : list.length === 0 ? (
            <p className="mt-8 text-ink/70">No reviews of {name} yet.</p>
          ) : (
            <ul>
              {list.map((r) => (
                <li key={r.id} className="grid gap-6 border-b border-ink py-10 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <div>
                    <div className="h-16 w-16 rounded-full border-2 border-ink bg-placeholder" />
                    <p className="mt-4 font-bold">{r.artist_name}</p>
                    {r.position && <p className="mt-1 text-[13px] text-ink/60">{r.position}</p>}
                    <p className="text-[13px] text-ink/60">{new Date(r.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</p>
                  </div>
                  <div>
                    {r.place_of_work && <p className="font-display text-[clamp(20px,2.2vw,30px)]">{r.place_of_work}</p>}
                    <p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-ink/85">{r.content}</p>
                    {r.artist_instagram && r.artist_instagram !== "Anonymous" && (
                      <a
                        href={`https://instagram.com/${r.artist_instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="label mt-5 inline-block border-[1.5px] border-ink px-3 py-2 hover:bg-lime"
                      >
                        @{r.artist_instagram.replace(/^@/, "")}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-20">
          <div className="bg-ink p-7 text-paper shadow-hard-pink">
            <p className="label text-paper/60">Reviewed by artists</p>
            <p className="font-display mt-3 text-[72px] text-lime">{n}</p>
            <p className="text-[15px] text-paper/80">{firstYear ? `reviews since ${firstYear}` : "no reviews yet"}</p>
          </div>
          <div className="border-[1.5px] border-ink p-7">
            <p className="font-display border-b-2 border-ink pb-3 text-[24px]">About</p>
            <dl>
              {[
                ["Places", company?.places.join(", ")],
                ["Positions reviewed", company?.positions.join(", ")],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-ink py-3">
                  <dt className="label text-ink/60">{k}</dt>
                  <dd className="mt-1 text-[15px]">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </section>

      <WriteReviewModal open={writeOpen} onClose={() => setWriteOpen(false)} onSaved={reload} defaultCompany={name} />
    </>
  );
}
