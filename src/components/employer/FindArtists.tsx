"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ds/Button";
import { Sticker } from "../ds/primitives";

const CARD_TONES = ["bg-lime", "bg-pink", "bg-blue", "bg-orange", "bg-stone", "bg-lime", "bg-pink", "bg-blue"];

/** Artist database teaser for employers on the free plan. */
export default function FindArtists() {
  const field = "flex flex-1 flex-col border-[1.5px] border-ink bg-paper px-5 py-3 -mr-[1.5px] max-md:-mb-[1.5px] max-md:mr-0";

  return (
    <>
      <section className="halftone border-b-[1.5px] border-ink bg-blue" style={{ ["--dot" as string]: "#4a58ff" }}>
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-14">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <h1 className="font-display text-shadow-hard text-[clamp(52px,13vw,170px)] text-paper lg:text-[clamp(52px,10vw,170px)]">
              Find<br /><span className="text-lime">artists.</span>
            </h1>
            <p className="max-w-sm text-[18px] leading-snug text-paper">
              Browse the whole base of performers, open full profiles and invite them to your contract directly.
            </p>
          </div>

          <div className="mt-12 flex flex-col shadow-hard md:flex-row" aria-disabled>
            <label className={`${field} md:flex-[2.5]`}>
              <span className="label text-ink/60">Search</span>
              <input disabled placeholder="Name, skill or style" className="mt-1 bg-transparent text-[18px] font-semibold outline-none placeholder:text-ink/50" />
            </label>
            {["Discipline", "Available from", "Country"].map((l) => (
              <label key={l} className={field}>
                <span className="label text-ink/60">{l}</span>
                <span className="mt-1 text-[18px] font-semibold">Any ▾</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-16">
        {/* Blurred preview grid */}
        <div className="pointer-events-none grid select-none grid-cols-2 gap-8 blur-[6px] md:grid-cols-4" aria-hidden>
          {CARD_TONES.map((tone, i) => (
            <div key={i} className="border-[1.5px] border-ink bg-paper shadow-hard">
              <div className={`p-6 ${tone}`}>
                <div className="aspect-[4/5] bg-ink/40" />
              </div>
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 bg-ink/30" />
                <div className="h-3 w-1/2 bg-ink/20" />
              </div>
            </div>
          ))}
        </div>

        {/* Paywall */}
        <div className="absolute inset-x-4 top-24 mx-auto max-w-2xl">
          <Sticker tone="lime" size={150} className="absolute -top-14 right-0 z-10 sm:-right-8">Pro only!</Sticker>
          <div className="-rotate-2 border-[1.5px] border-ink bg-pink p-6 shadow-hard sm:p-10">
            <p className="label">You&apos;re on the free plan</p>
            <h2 className="font-display mt-4 text-[clamp(26px,7.4vw,64px)] md:text-[clamp(36px,5vw,64px)]">Cast them<br />yourself.</h2>
            <p className="mt-5 max-w-md text-[17px] leading-snug">
              Pro lets you browse every artist, open full profiles with showreels and invite the right people straight to
              your contract. It is coming soon.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Button href="/pricing" variant="ink" arrow>Compare plans</Button>
              <Link href="/employer/jobs/new" className="label border-b-2 border-ink pb-0.5">Post a contract instead</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
