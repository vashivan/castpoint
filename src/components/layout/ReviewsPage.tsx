'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '../../context/AuthContext';
import { Button } from '../ds/Button';
import { Sticker, Tag } from '../ds/primitives';
import WriteReviewModal from '../reviews/WriteReviewModal';
import { useReviews, type CompanySummary } from '../reviews/useReviews';

type Sort = 'most' | 'newest';

const THUMBS = [
  ['bg-blue', 'bg-navy'],
  ['bg-lime', 'bg-[#3d4a12]'],
  ['bg-pink', 'bg-[#4a1630]'],
  ['bg-orange', 'bg-[#4a2210]'],
  ['bg-stone', 'bg-placeholder'],
];

function CompanyRow({ c, i }: { c: CompanySummary; i: number }) {
  const [outer, inner] = THUMBS[i % THUMBS.length];
  const n = c.reviews.length;
  return (
    <li>
      <Link href={`/reviews/${c.slug}`} className="group flex items-center gap-6 border-b-[1.5px] border-ink py-6">
        <div className={`grid h-24 w-28 shrink-0 place-items-center border-[1.5px] border-ink ${outer}`}>
          <div className={`h-[70%] w-[72%] ${inner}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-[clamp(20px,2.4vw,34px)]">{c.name}</p>
          <p className="mt-1 truncate text-[14px] text-ink/60">
            {[c.places[0], `${n} review${n === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-1 line-clamp-2 text-[15px]">“{c.latest.content}”</p>
        </div>
        <div className="grid h-24 w-24 shrink-0 rotate-2 place-items-center border-[1.5px] border-ink bg-lime shadow-hard-sm group-hover:-rotate-2 max-sm:hidden">
          <div className="text-center">
            <p className="font-display text-[40px]">{n}</p>
            <p className="label -mt-1 text-[8px]">review{n === 1 ? '' : 's'}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const { reviews, companies, error, reload } = useReviews();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('most');
  const [writeOpen, setWriteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? companies.filter((c) =>
          [c.name, ...c.places, ...c.positions, ...c.reviews.map((r) => r.content)].some((s) => s?.toLowerCase().includes(q))
        )
      : companies;
    return [...list].sort((a, b) =>
      sort === 'most'
        ? b.reviews.length - a.reviews.length
        : +new Date(b.latest.created_at) - +new Date(a.latest.created_at)
    );
  }, [companies, search, sort]);

  const fresh = useMemo(() => (reviews ?? []).slice(0, 3), [reviews]);

  const openWrite = () => (user ? setWriteOpen(true) : (window.location.href = '/login'));

  return (
    <>
      {/* Hero */}
      <section className="halftone relative overflow-hidden border-b-[1.5px] border-ink bg-pink" style={{ ['--dot' as string]: '#c22f80' }}>
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12">
          <Tag tone="lime" className="-rotate-1 border-[1.5px] border-ink px-4 py-2 text-[13px] italic">The artists&apos; review base</Tag>
          <Sticker tone="lime" size={170} className="absolute right-6 top-10 max-md:hidden">Honest reviews</Sticker>
          <h1 className="font-display text-shadow-hard mt-6 text-[clamp(52px,14vw,200px)] text-paper lg:text-[clamp(52px,12vw,200px)]">
            Know<br />before<br />you sign
          </h1>

          <form onSubmit={(e) => e.preventDefault()} className="relative mt-8 flex max-w-5xl flex-col shadow-hard md:flex-row lg:-mt-6">
            <label className="flex flex-1 flex-col border-[1.5px] border-ink bg-paper px-6 py-3">
              <span className="label text-ink/60">Company, venue, ship or city</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try “cruise” or “Europe”"
                className="mt-1 bg-transparent text-[clamp(16px,1.6vw,22px)] font-semibold outline-none placeholder:text-ink/50"
              />
            </label>
            <button type="submit" className="border-[1.5px] border-ink bg-ink px-10 py-4 text-[13px] font-bold uppercase tracking-[0.12em] text-paper max-md:-mt-[1.5px] md:-ml-[1.5px]">
              Search →
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto grid max-w-7xl items-start gap-14 px-4 py-16 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside>
          <p className="font-display text-[48px]">{reviews === null ? '–' : filtered.length}</p>
          <p className="label text-ink/60">Companies found</p>

          <p className="label mt-10 border-b-2 border-ink pb-2">Sort by</p>
          <div className="mt-3 space-y-2">
            {([['most', 'Most reviewed'], ['newest', 'Newest reviews']] as const).map(([v, label]) => (
              <label key={v} className="flex cursor-pointer items-center gap-3 text-[16px]">
                <input type="radio" name="sort" checked={sort === v} onChange={() => setSort(v)} className="h-4 w-4 accent-ink" />
                {label}
              </label>
            ))}
          </div>

          <Button variant="lime" onClick={openWrite} className="mt-10 w-full">Write a review <span>+</span></Button>
        </aside>

        <div>
          {!user ? (
            <div className="border-[1.5px] border-ink bg-white p-10 shadow-hard">
              <p className="font-display text-[clamp(26px,3vw,40px)]">Sign in to read reviews.</p>
              <p className="mt-3 text-ink/70">Reviews are written by artists, for artists. Sign in or create a free profile to read them.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/login" variant="ink" arrow>Sign in</Button>
                <Button href="/signup" variant="secondary">Create profile</Button>
              </div>
            </div>
          ) : error ? (
            <p className="font-semibold text-pink">{error}</p>
          ) : reviews === null ? (
            <p className="label text-ink/50">Loading reviews…</p>
          ) : filtered.length === 0 ? (
            <div className="border-[1.5px] border-ink bg-white p-10 shadow-hard">
              <p className="font-display text-[clamp(26px,3vw,40px)]">No reviews about it yet.</p>
              <p className="mt-3 text-ink/70">You could be the first to write one.</p>
              <Button onClick={openWrite} arrow className="mt-6">Write a review</Button>
            </div>
          ) : (
            <ul className="border-t-[1.5px] border-ink">
              {filtered.map((c, i) => (
                <CompanyRow key={c.name} c={c} i={i} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Fresh from backstage */}
      {user && fresh.length > 0 && (
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-7xl px-4 py-24">
            <h2 className="font-display text-[clamp(38px,8vw,110px)] lg:text-[clamp(40px,6.6vw,110px)]">
              Fresh from<br /><span className="text-lime">backstage</span>
            </h2>
            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {fresh.map((r, i) => {
                const tone = ['bg-lime shadow-hard-pink', 'bg-pink shadow-hard-lime', 'bg-paper shadow-hard-blue'][i];
                const tail = ['border-t-lime', 'border-t-pink', 'border-t-paper'][i];
                return (
                  <div key={r.id} className="md:[margin-top:var(--offset)]" style={{ ['--offset' as string]: `${i * 64}px` }}>
                    <div className={`relative border-[1.5px] border-paper p-7 text-ink ${tone}`}>
                      <p className="label">{[r.company_name, r.position].filter(Boolean).join(' · ')}</p>
                      <p className="mt-3 line-clamp-5 text-[18px] font-semibold leading-snug">{r.content}</p>
                      <span aria-hidden className={`absolute -bottom-5 left-10 h-0 w-0 border-l-[16px] border-r-[6px] border-t-[20px] border-l-transparent border-r-transparent ${tail}`} />
                    </div>
                    <div className="ml-6 mt-8 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full border-2 border-paper bg-placeholder" />
                      <div>
                        <p className="font-bold">{r.artist_name}</p>
                        <p className="label text-paper/60">{[r.position, new Date(r.created_at).getFullYear()].filter(Boolean).join(' · ')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Worked there? */}
      <section className="halftone bg-lime" style={{ ['--dot' as string]: '#a9d900' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 lg:grid-cols-2">
          <h2 className="font-display text-[clamp(48px,10vw,130px)] lg:text-[clamp(48px,8vw,130px)]">Worked<br />there?</h2>
          <div className="-rotate-2 border-[1.5px] border-ink bg-paper p-8 shadow-hard">
            <p className="text-[19px] leading-snug">
              Tell other artists about pay, housing, hours and management. Publish under your name or anonymously. The next cast will thank you.
            </p>
            <Button variant="ink" arrow onClick={openWrite} className="mt-6 w-full">Write a review</Button>
          </div>
        </div>
      </section>

      <WriteReviewModal open={writeOpen} onClose={() => setWriteOpen(false)} onSaved={reload} />
    </>
  );
}
