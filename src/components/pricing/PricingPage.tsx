"use client";

import React, { useState } from "react";
import { Button } from "../ds/Button";
import { Sticker } from "../ds/primitives";
import { cn } from "@/lib/utils";

type Audience = "artists" | "employers";

type Plan = {
  name: string;
  price: string;
  per?: string;
  blurb: string;
  features: { text: string; included: boolean }[];
  cta: { label: string; href?: string };
};

const PLANS: Record<Audience, { free: Plan; pro: Plan; sticker: string }> = {
  artists: {
    sticker: "Apply without limits!",
    free: {
      name: "Free",
      price: "$0",
      blurb: "Everything you need to start looking.",
      features: [
        { text: "Artist profile with photos & showreel", included: true },
        { text: "2 applications per month", included: true },
        { text: "Read and write reviews", included: true },
        { text: "Unlimited applications", included: false },
      ],
      cta: { label: "Start free", href: "/signup" },
    },
    pro: {
      name: "Pro",
      price: "$5",
      per: "/ month",
      blurb: "For artists who are actively looking for the next contract.",
      features: [
        { text: "Unlimited applications", included: true },
        { text: "Everything in Free", included: true },
      ],
      cta: { label: "Pro is coming soon" },
    },
  },
  employers: {
    sticker: "Cast them yourself!",
    free: {
      name: "Free",
      price: "$0",
      blurb: "Post contracts and receive applications.",
      features: [
        { text: "Company profile with verification", included: true },
        { text: "Post job offers", included: true },
        { text: "Full applications with PDF profiles", included: true },
        { text: "Search the artist database", included: false },
      ],
      cta: { label: "Register company", href: "/employer/register" },
    },
    pro: {
      name: "Pro",
      price: "Soon",
      blurb: "Find artists and invite them to your contract directly.",
      features: [
        { text: "Search every artist profile", included: true },
        { text: "Invite artists to your offers", included: true },
        { text: "Everything in Free", included: true },
      ],
      cta: { label: "Pro is coming soon" },
    },
  },
};

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes. Pro stays active until the end of the paid month, then you return to Free." },
  { q: "What counts as an application?", a: "Every job offer you apply to. The counter resets on the 1st of each month." },
  { q: "Are reviews free?", a: "Always. Reading and writing reviews is free for everyone on Castpoint." },
];

function Features({ items }: { items: Plan["features"] }) {
  return (
    <ul className="border-t-[1.5px] border-ink">
      {items.map((f) => (
        <li key={f.text} className={cn("flex gap-4 border-b border-ink py-3.5 text-[16px]", !f.included && "text-ink/40 line-through")}>
          <span className="w-4 shrink-0 font-bold">{f.included ? "✓" : "×"}</span>
          {f.text}
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  const [audience, setAudience] = useState<Audience>("artists");
  const { free, pro, sticker } = PLANS[audience];

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-16">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <h1 className="font-display text-[clamp(56px,14vw,190px)] lg:text-[clamp(56px,11vw,190px)]">
            Pick<br />your<br /><span className="text-outline-ink">part.</span>
          </h1>
          <div className="flex border-[1.5px] border-ink shadow-hard" role="tablist">
            {(["artists", "employers"] as const).map((a) => (
              <button
                key={a}
                role="tab"
                aria-selected={audience === a}
                onClick={() => setAudience(a)}
                className={cn(
                  "cursor-pointer px-8 py-4 text-left text-[13px] font-bold uppercase leading-tight tracking-[0.1em]",
                  audience === a ? "bg-ink text-paper" : "bg-paper"
                )}
              >
                For<br />{a}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16 grid items-start gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
          <div className="mt-10 border-[1.5px] border-ink bg-paper p-10 shadow-hard">
            <p className="label">{free.name}</p>
            <p className="font-display mt-6 text-[96px] leading-[0.8]">{free.price}</p>
            <p className="mt-6 text-[17px] text-ink/70">{free.blurb}</p>
            <div className="mt-6"><Features items={free.features} /></div>
            {free.cta.href && (
              <Button href={free.cta.href} variant="secondary" arrow className="mt-10 w-full">{free.cta.label}</Button>
            )}
          </div>

          <div className="relative">
            <Sticker tone="pink" size={160} className="absolute -top-14 right-0 z-10 sm:-right-6">
              {sticker}
            </Sticker>
            <div className="halftone rotate-1 border-[1.5px] border-ink bg-lime p-10 shadow-hard" style={{ ["--dot" as string]: "#a9d900" }}>
              <p className="label">{pro.name}</p>
              <p className="mt-6 flex items-end gap-3">
                <span className="font-display text-[110px] leading-[0.8] [text-shadow:4px_4px_0_var(--color-paper)]">{pro.price}</span>
                {pro.per && <span className="pb-2 text-[20px] font-bold">{pro.per}</span>}
              </p>
              <p className="mt-6 text-[17px]">{pro.blurb}</p>
              <div className="mt-6 border-[1.5px] border-ink bg-paper px-6">
                <Features items={pro.features} />
              </div>
              <div className="mt-10 flex items-center justify-between bg-ink px-6 py-4 text-[12px] font-bold uppercase tracking-[0.1em] text-paper">
                {pro.cta.label} <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-3">
          {FAQ.map((f) => (
            <div key={f.q} className="border-t-2 border-lime pt-6">
              <p className="font-display text-[22px] leading-[1]">{f.q}</p>
              <p className="mt-4 text-[16px] leading-relaxed text-paper/80">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
