'use client'

import React, { useEffect, useMemo, useState } from 'react';

// Types that match the expected /api/jobs response
export type Job = {
  id: number;
  title: string;
  company_name: string;
  location?: string;
  contract_type?: 'short' | 'medium' | 'long';
  salary_from?: number | null;
  salary_to?: number | null;
  currency?: string;
  description?: string;
};

export default function VacanciesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [search, setSearch] = useState('');
  const [contract, setContract] = useState<'all' | Job['contract_type']>('all');
  const [location, setLocation] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const qs = new URLSearchParams();
        // Keep query params minimal; backend can optionally use them
        if (search) qs.set('q', search);
        if (contract && contract !== 'all') qs.set('contract', contract!);
        if (location) qs.set('location', location);

        const res = await fetch(`/api/jobs${qs.toString() ? `?${qs.toString()}` : ''}`);
        if (!res.ok) throw new Error('Failed to load jobs');
        const data = await res.json();
        if (!cancelled) setJobs(data.jobs || []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [search, contract, location]);

  const filtered = useMemo(() => {
    let list = jobs;

    // Client-side filter as a fallback (in case API ignores query params)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((j) =>
        `${j.title} ${j.company_name} ${j.location ?? ''} ${j.description ?? ''}`
          .toLowerCase()
          .includes(q)
      );
    }
    if (contract !== 'all') list = list.filter((j) => j.contract_type === contract);
    if (location.trim()) {
      const ql = location.toLowerCase();
      list = list.filter((j) => (j.location || '').toLowerCase().includes(ql));
    }
    return list;
  }, [jobs, search, contract, location]);

  return (
    <main className="min-h-screen px-6 py-16 sm:py-20 flex flex-col items-center bg-transparent">
      <section className="w-full max-w-6xl">
        <header className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Вакансії</h1>
          <p className="text-black/60 mt-2">Знаходь контракти, відгукуйся в один клік, отримуй відповідь на email.</p>
        </header>

        {/* Filters */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-12 mb-6 sm:mb-8">
          <div className="sm:col-span-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук за назвою, компанією, описом"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="sm:col-span-3">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Локація (місто/країна)"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <ContractChip label="Всі" active={contract === 'all'} onClick={() => setContract('all')} />
            <ContractChip label="Short" active={contract === 'short'} onClick={() => setContract('short')} />
            <ContractChip label="Medium" active={contract === 'medium'} onClick={() => setContract('medium')} />
            <ContractChip label="Long" active={contract === 'long'} onClick={() => setContract('long')} />
          </div>
        </div>

        {/* Content states */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-black/60">Завантаження…</div>
        )}
        {!!error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {!loading && !error && (
          filtered.length ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )
        )}
      </section>
    </main>
  );
}

function ContractChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-2xl border ${active ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black'} transition`}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-black/10 bg-white">
      <div className="text-4xl">💼</div>
      <h3 className="mt-2 text-lg font-semibold">Наразі вакансій немає</h3>
      <p className="mt-1 text-black/60">Підпишись на оновлення або перевір пізніше.</p>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="text-sm text-black/60">{job.company_name}{job.location ? ` · ${job.location}` : ''}</p>
          {!!job.contract_type && (
            <div className="mt-2 inline-flex items-center rounded-full border border-black/10 px-2.5 py-1 text-xs uppercase tracking-wide">
              {job.contract_type}
            </div>
          )}
        </div>
        <div className="text-right">
          <SalaryBadge from={job.salary_from} to={job.salary_to} currency={job.currency} />
        </div>
      </div>
      {job.description && (
        <p className="mt-3 text-sm text-black/80 line-clamp-3">{job.description}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-xl bg-black text-white">Відгукнутись</button>
      </div>

      {open && <ApplyModal jobId={job.id} onClose={() => setOpen(false)} />}
    </div>
  );
}

function SalaryBadge({ from, to, currency }: { from?: number | null; to?: number | null; currency?: string }) {
  if (from == null && to == null) return null;
  const cur = currency || 'USD';
  const text = from != null && to != null
    ? `${from.toLocaleString()}–${to.toLocaleString()} ${cur}`
    : from != null
    ? `from ${from.toLocaleString()} ${cur}`
    : `up to ${to!.toLocaleString()} ${cur}`;
  return (
    <div className="inline-flex items-center rounded-xl border border-black/10 bg-gray-50 px-2.5 py-1 text-xs text-black/80">
      {text}
    </div>
  );
}

function ApplyModal({ jobId, onClose }: { jobId: number; onClose: () => void }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    instagram: '',
    profile_url: '',
    city: '',
    country: '',
    cover_message: '',
    cv_url: '',
    portfolio_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    try {
      setLoading(true);
      setStatus('idle');
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          artist: {
            full_name: form.full_name,
            email: form.email,
            phone: form.phone || undefined,
            instagram: form.instagram || undefined,
            profile_url: form.profile_url || undefined,
            city: form.city || undefined,
            country: form.country || undefined,
          },
          cover_message: form.cover_message,
          cv_url: form.cv_url || undefined,
          portfolio_url: form.portfolio_url || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || 'Failed');
      setStatus('ok');
    } catch (e) {
      setStatus('err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-5">
        <button onClick={onClose} className="absolute right-3 top-3 text-black/60">✕</button>
        <h3 className="mb-3 text-lg font-semibold">Відгук на вакансію</h3>
        <div className="grid grid-cols-1 gap-3">
          <input name="full_name" placeholder="Ім'я та прізвище" className="input" onChange={handle} />
          <input name="email" placeholder="Email" className="input" onChange={handle} />
          <input name="phone" placeholder="Телефон (необов'язково)" className="input" onChange={handle} />
          <input name="instagram" placeholder="Instagram (необов'язково)" className="input" onChange={handle} />
          <input name="profile_url" placeholder="Посилання на профіль Castpoint (необов'язково)" className="input" onChange={handle} />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" placeholder="Місто" className="input" onChange={handle} />
            <input name="country" placeholder="Країна" className="input" onChange={handle} />
          </div>
          <textarea name="cover_message" placeholder="Коротке повідомлення" className="input min-h-28" onChange={handle} />
          <div className="grid grid-cols-2 gap-3">
            <input name="cv_url" placeholder="Посилання на CV (необов'язково)" className="input" onChange={handle} />
            <input name="portfolio_url" placeholder="Портфоліо (необов'язково)" className="input" onChange={handle} />
          </div>
          <button disabled={loading} onClick={submit} className="mt-1 rounded-xl bg-black px-4 py-2 text-white">
            {loading ? 'Надсилання…' : 'Надіслати відгук'}
          </button>
          {status === 'ok' && (
            <p className="text-sm text-green-600">Відгук надіслано! Перевір пошту — роботодавцю вже пішов лист.</p>
          )}
          {status === 'err' && (
            <p className="text-sm text-red-600">Сталася помилка. Спробуй ще раз, будь ласка.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Minimal input styling via Tailwind utility class name "input".
// Add this to your globals or tailwind layer if you don't have it already.
// .input { @apply w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10; }
