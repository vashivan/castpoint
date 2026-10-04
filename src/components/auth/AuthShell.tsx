import React from "react";
import { cn } from "@/lib/utils";

type Tone = "lime" | "pink" | "blue";

const TONES: Record<Tone, { bg: string; dot: string; text: string }> = {
  lime: { bg: "bg-lime", dot: "#a9d900", text: "text-ink" },
  pink: { bg: "bg-pink", dot: "#c22f80", text: "text-paper text-shadow-hard" },
  blue: { bg: "bg-blue", dot: "#4a58ff", text: "text-paper text-shadow-hard" },
};

/** Split layout for auth pages: big display title on a colour field, form card on paper. */
export default function AuthShell({
  tone = "lime",
  kicker,
  title,
  aside,
  wide = false,
  children,
}: {
  tone?: Tone;
  kicker: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <section className={cn("grid min-h-[calc(100vh-3.25rem)]", wide ? "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" : "lg:grid-cols-2")}>
      <div className={cn("halftone relative flex flex-col justify-between border-b-[1.5px] border-ink px-4 py-12 lg:border-b-0 lg:border-r-[1.5px] lg:px-12", t.bg)} style={{ ["--dot" as string]: t.dot }}>
        <div>
          <p className="label flex items-center gap-2"><span className="inline-block h-2 w-2 bg-current" />{kicker}</p>
          <h1 className={cn("font-display mt-8 text-[clamp(34px,10vw,120px)]", wide ? "lg:text-[clamp(36px,3.8vw,96px)]" : "lg:text-[clamp(44px,6.4vw,120px)]", t.text)}>{title}</h1>
        </div>
        {aside && <div className="mt-10 max-w-md text-[16px] leading-relaxed">{aside}</div>}
      </div>
      <div className="flex items-start justify-center px-4 py-12 lg:px-12 lg:py-20">
        <div className={cn("w-full", wide ? "max-w-3xl" : "max-w-md")}>{children}</div>
      </div>
    </section>
  );
}
