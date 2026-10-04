'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Job } from '../../utils/Types';
import { Button } from '../ds/Button';
import { Kicker, Tabs } from '../ds/primitives';
import ContractRow from '../vacancies/ContractRow';
import { DISCIPLINES } from '@/lib/jobFormat';

type ContractFilter = 'all' | NonNullable<Job['contract_type']>;

export default function VacanciesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [contract, setContract] = useState<ContractFilter>('all');
  const [location, setLocation] = useState('');
  const [discipline, setDiscipline] = useState<string>('all');

  // Prefill filters from the home page search (?q=…&location=…)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) setSearch(params.get('q')!);
    if (params.get('location')) setLocation(params.get('location')!);
    const d = params.get('discipline');
    if (d && DISCIPLINES.some((x) => x.value === d)) setDiscipline(d);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const qs = new URLSearchParams({ pageSize: '50' });
        if (search) qs.set('q', search);
        if (contract !== 'all') qs.set('contract', contract);
        if (location) qs.set('location', location);
        if (discipline !== 'all') qs.set('discipline', discipline);

        const res = await fetch(`/api/jobs?${qs}`);
        if (!res.ok) throw new Error('Failed to load contracts');
        const data = await res.json();
        if (!cancelled) setJobs(data.jobs || []);
      } catch (error) {
        if (!cancelled) setError(error instanceof Error ? error.message : String(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, contract, location, discipline]);

  const newestIds = useMemo(() => new Set(jobs.slice(0, 2).map((j) => j.id)), [jobs]);

  const field = 'flex flex-1 flex-col border-[1.5px] border-ink bg-white px-5 py-3 -mr-[1.5px] max-md:-mb-[1.5px] max-md:mr-0';

  return (
    <>
      <section className="halftone border-b border-ink bg-lime" style={{ ['--dot' as string]: '#a9d900' }}>
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-14">
          <Kicker>{loading ? 'Loading…' : `${jobs.length} open contract${jobs.length === 1 ? '' : 's'}`}</Kicker>
          <h1 className="font-display mt-6 text-[clamp(34px,9.2vw,170px)] lg:text-[clamp(48px,10vw,170px)]">
            All<br />contracts.
          </h1>

          <div className="mt-10 flex max-w-4xl flex-col shadow-hard md:flex-row">
            <label className={field}>
              <span className="label text-ink/60">Role, company or keyword</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try “dancer” or “cruise”"
                className="mt-1 bg-transparent text-[15px] font-semibold outline-none placeholder:text-ink/40"
              />
            </label>
            <label className={field}>
              <span className="label text-ink/60">Region</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Worldwide"
                className="mt-1 bg-transparent text-[15px] font-semibold outline-none placeholder:text-ink"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <Tabs<string>
          value={discipline}
          onChange={setDiscipline}
          className="mb-4"
          options={[{ value: 'all', label: 'All disciplines' }, ...DISCIPLINES.map((d) => ({ value: d.value as string, label: d.label }))]}
        />
        <Tabs<ContractFilter>
          value={contract}
          onChange={setContract}
          options={[
            { value: 'all', label: 'All lengths' },
            { value: 'short', label: 'Up to 3 months' },
            { value: 'medium', label: '4–9 months' },
            { value: 'long', label: '10+ months' },
          ]}
        />

        {error ? (
          <p className="mt-10 font-semibold text-pink">{error}</p>
        ) : loading ? (
          <p className="label mt-10 text-ink/50">Loading contracts…</p>
        ) : jobs.length === 0 ? (
          <div className="mt-10 border-[1.5px] border-ink bg-white p-10 shadow-hard">
            <p className="font-display text-[clamp(26px,3vw,40px)]">Nothing matches yet.</p>
            <p className="mt-3 text-ink/70">Try a wider search, or subscribe below to hear about new contracts first.</p>
            <Button variant="secondary" className="mt-6" onClick={() => { setSearch(''); setLocation(''); setContract('all'); setDiscipline('all'); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <ul className="mt-10 border-t-[1.5px] border-ink">
            {jobs.map((job) => (
              <ContractRow key={job.id} job={job} isNew={newestIds.has(job.id)} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
