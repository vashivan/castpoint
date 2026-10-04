import React from "react";
import { Sticker } from "./primitives";

/** Full-width confirmation / status page with a giant headline. */
export default function MessagePage({
  kicker,
  title,
  sticker,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  sticker?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="halftone relative overflow-hidden border-b-[1.5px] border-ink bg-lime" style={{ ["--dot" as string]: "#a9d900" }}>
      <div className="relative mx-auto min-h-[70vh] max-w-7xl px-4 py-20">
        {sticker && (
          <Sticker tone="pink" size={170} className="absolute right-6 top-12 max-md:hidden">
            {sticker}
          </Sticker>
        )}
        <p className="label flex items-center gap-2"><span className="inline-block h-2 w-2 bg-current" />{kicker}</p>
        <h1 className="font-display mt-8 text-[clamp(48px,12vw,180px)] lg:text-[clamp(48px,10vw,180px)]">{title}</h1>
        {children && <div className="mt-10 max-w-xl text-[18px] leading-relaxed">{children}</div>}
      </div>
    </section>
  );
}
