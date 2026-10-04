'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '../../context/AuthContext';
import { Button } from '../ds/Button';
import { Tag } from '../ds/primitives';
import ContractRow from '../vacancies/ContractRow';
import type { Job, Review } from '../../utils/Types';

type MyApp = {
  id: number;
  job_id: number;
  application_code: string | null;
  status: string;
  created_at: string;
  application_title: string;
};

/** Status values in the DB mix "under_review" and "under review". */
function statusTag(status: string) {
  const s = status.replace('_', ' ').toLowerCase();
  if (s === 'approved') return { label: 'Approved', cls: 'bg-lime text-ink' };
  if (s === 'rejected') return { label: 'Rejected', cls: 'bg-pink text-ink' };
  if (s === 'under review') return { label: 'Under review', cls: 'bg-blue text-paper' };
  return { label: s || 'Pending', cls: 'border border-paper text-paper' };
}

/** Home page for a signed-in artist. */
export default function AuthenticatedHome() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [apps, setApps] = useState<MyApp[] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch('/api/jobs?pageSize=5', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { jobs: [] }))
      .then((d) => setJobs(d.jobs ?? []))
      .catch(() => setJobs([]));
    fetch('/api/my_application', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { applications: [] }))
      .then((d) => setApps(d.applications ?? []))
      .catch(() => setApps([]));
    fetch('/api/get_reviews')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setReviews(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => setReviews([]));
  }, []);

  const stats = useMemo(() => {
    const list = apps ?? [];
    const by = (s: string) => list.filter((a) => statusTag(a.status).label === s).length;
    return [
      { label: 'Applications', value: list.length },
      { label: 'Under review', value: by('Under review') },
      { label: 'Approved', value: by('Approved') },
      { label: 'Rejected', value: by('Rejected') },
    ];
  }, [apps]);

  if (!user) return null;
  const firstName = user.first_name || user.name?.split(' ')[0] || '';

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-14">
        <p className="label">{['Artist', user.role, user.country].filter(Boolean).join(' · ')}</p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
          <h1 className="font-display text-[clamp(40px,10vw,150px)] lg:text-[clamp(44px,8.4vw,150px)]">
            Welcome<br />back, <span className="text-outline-ink">{firstName}.</span>
          </h1>
          <Button href="/vacancies" arrow>Find contracts</Button>
        </div>
      </section>

      <section className="border-y-[1.5px] border-ink bg-lime">
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`border-ink px-6 py-6 max-md:border-b ${i < 3 ? 'md:border-r' : ''} ${i % 2 === 0 ? 'max-md:border-r' : ''}`}>
              <dt className="label">{s.label}</dt>
              <dd className="font-display mt-4 text-[clamp(44px,5vw,80px)]">{apps === null ? '–' : s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-7xl items-start gap-14 px-4 py-20 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <div className="flex items-end justify-between border-b-2 border-ink pb-4">
            <h2 className="font-display text-[clamp(32px,4.4vw,64px)]">New contracts</h2>
            <Link href="/vacancies" className="label hover:underline">View all →</Link>
          </div>
          {jobs === null ? (
            <p className="label mt-6 text-ink/50">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="mt-6 text-ink/70">No new contracts yet. Check back soon.</p>
          ) : (
            <ul>
              {jobs.map((j, i) => (
                <ContractRow key={j.id} job={j} isNew={i < 2} />
              ))}
            </ul>
          )}
        </div>

        <aside className="bg-ink text-paper shadow-hard-lime">
          <div className="border-b border-paper/15 p-7">
            <h2 className="font-display text-[clamp(28px,3vw,44px)]">My applications</h2>
            <p className="mt-2 text-[14px] text-paper/60">Questions about an application? Contact us with its code.</p>
          </div>
          {apps === null ? (
            <p className="label p-7 text-paper/50">Loading…</p>
          ) : apps.length === 0 ? (
            <div className="p-7">
              <p className="text-paper/70">No applications yet.</p>
              <Button href="/vacancies" variant="lime" arrow className="mt-5 w-full shadow-none hover:shadow-none">Browse contracts</Button>
            </div>
          ) : (
            <ul>
              {apps.slice(0, 6).map((a) => {
                const st = statusTag(a.status);
                return (
                  <li key={a.id} className="border-b border-paper/15 px-7 py-5">
                    <Link href={`/vacancies/${a.job_id}`} className="block truncate text-[17px] font-bold hover:text-lime">{a.application_title}</Link>
                    <p className="mt-1 text-[12px] text-paper/50">
                      {[a.application_code, new Date(a.created_at).toLocaleDateString()].filter(Boolean).join(' · ')}
                    </p>
                    <span className={`mt-2 inline-block px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em] ${st.cls}`}>{st.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </section>

      <section className="border-t border-ink bg-stone">
        <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-20 md:grid-cols-3">
          <div className="border-[1.5px] border-ink bg-paper shadow-hard">
            {user.pic_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.pic_url} alt={user.name} className="h-64 w-full object-cover grayscale-[30%]" />
            ) : (
              <div className="relative h-64 bg-panel">
                <p className="label absolute bottom-3 left-5 text-paper/50">[your headshot]</p>
              </div>
            )}
            <div className="p-7">
              <p className="font-display text-[clamp(24px,2.6vw,36px)]">{[user.first_name, user.second_name].filter(Boolean).join(' ') || user.name}</p>
              <p className="mt-1 text-ink/60">{[user.role, user.country].filter(Boolean).join(' · ')}</p>
              <Button href="/profile" variant="ink" arrow className="mt-6 w-full">Edit profile</Button>
            </div>
          </div>

          <div className="border-[1.5px] border-ink bg-paper p-7 shadow-hard md:col-span-2">
            <div className="flex items-end justify-between border-b-2 border-ink pb-4">
              <p className="font-display text-[clamp(24px,2.6vw,36px)]">Latest reviews</p>
              <Link href="/reviews" className="label hover:underline">All reviews →</Link>
            </div>
            {reviews.length === 0 ? (
              <p className="mt-6 text-ink/70">No reviews yet. Worked a contract? Tell the next cast how it was.</p>
            ) : (
              <ul>
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-ink py-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <Tag tone="ink">{r.company_name}</Tag>
                      <span className="label text-ink/50">{r.position}</span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed">“{r.content}”</p>
                  </li>
                ))}
              </ul>
            )}
            <Button href="/reviews" variant="lime" className="mt-6">Write a review <span>+</span></Button>
          </div>
        </div>
      </section>
    </>
  );
}
