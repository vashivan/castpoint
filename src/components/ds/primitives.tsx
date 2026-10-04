import React from "react";
import { cn } from "@/lib/utils";

/* ---------------- Tag ---------------- */

type TagTone = "lime" | "pink" | "blue" | "outline" | "grey" | "ink";

const tagTones: Record<TagTone, string> = {
  lime: "bg-lime text-ink",
  pink: "bg-pink text-ink",
  blue: "bg-blue text-paper",
  outline: "border border-current",
  grey: "bg-stone text-ink/60",
  ink: "bg-ink text-paper",
};

export function Tag({ tone = "lime", className, children }: { tone?: TagTone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-block px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em] leading-none", tagTones[tone], className)}>
      {children}
    </span>
  );
}

/* ---------------- Starburst sticker ---------------- */

function starPoints(spikes: number, outer: number, inner: number, c = 50) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    pts.push(`${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export function Sticker({
  tone = "lime",
  size = 128,
  className,
  children,
}: {
  tone?: "lime" | "pink";
  size?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <polygon
          points={starPoints(16, 50, 40)}
          fill={tone === "lime" ? "var(--color-lime)" : "var(--color-pink)"}
          stroke="var(--color-ink)"
          strokeWidth="1.5"
        />
      </svg>
      <span className="font-display relative -rotate-[15deg] px-3 text-center text-[13px] leading-[0.95] text-ink">
        {children}
      </span>
    </div>
  );
}

/* ---------------- Section kicker ---------------- */

export function Kicker({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("label flex items-center gap-2", className)}><span className="inline-block h-2 w-2 bg-current" />{children}</p>;
}

/* ---------------- Logo ---------------- */

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "paper" }) {
  return (
    <span className={cn("font-display text-[19px] tracking-tight", tone === "ink" ? "text-ink" : "text-paper", className)}>
      Castpoint
    </span>
  );
}

/* ---------------- Tabs (square, caps) ---------------- */

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "border-[1.5px] border-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] cursor-pointer",
            value === o.value ? "bg-ink text-paper" : "bg-transparent hover:bg-ink/5"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
