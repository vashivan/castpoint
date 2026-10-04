import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "lime" | "paper" | "ink";

const base =
  "relative inline-flex items-center justify-between gap-3 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.1em] " +
  "transition-transform duration-150 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // Black block with a pink offset block behind it
  primary:
    "bg-ink text-paper shadow-[6px_6px_0_0_var(--color-pink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--color-pink)] active:translate-x-1 active:translate-y-1 active:shadow-none",
  secondary: "border-[1.5px] border-ink text-ink bg-transparent hover:bg-ink hover:text-paper",
  lime: "bg-lime text-ink border-[1.5px] border-ink shadow-[6px_6px_0_0_var(--color-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--color-ink)]",
  paper: "bg-paper text-ink border-[1.5px] border-ink hover:bg-lime",
  // Flat black bar (used inside cards)
  ink: "bg-ink text-paper hover:bg-panel-2",
};

type CommonProps = {
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps & { href: string; target?: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", arrow, className, children } = props;
  const classes = cn(base, variants[variant], className);
  const content = (
    <>
      {children}
      {arrow && <span aria-hidden>→</span>}
    </>
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} target={props.target} className={classes}>
        {content}
      </Link>
    );
  }

  const { variant: _v, arrow: _a, className: _c, children: _ch, ...rest } = props;
  return (
    <button type="button" {...rest} className={classes}>
      {content}
    </button>
  );
}
