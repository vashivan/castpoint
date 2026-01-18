'use client'

import { Loader } from 'lucide-react';
import { Job } from '../../utils/Types';
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';


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
      } catch (error) {
        if (!cancelled) setError(error instanceof Error ? error.message : String(error));
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
    <main className="min-h-screen px-6 py-16 flex flex-col items-center bg-transparent">
      <section className="w-full max-w-6xl mt-10">
        <header className="mb-6 sm:mb-10">
          <h1 className="text-4xl uppercase tracking-tight">Vacancies</h1>
          <p className="text-black/60 mt-2">Find your future job and apply in one click</p>
        </header>

        {/* Filters */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-12 mb-6 sm:mb-8">
          <div className="sm:col-span-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find job by title, company, keywords…"
              className="w-full rounded-2xl border border-black/30 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="sm:col-span-4">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (city/country)"
              className="w-full rounded-2xl border border-black/30 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="sm:col-span-4 flex gap-2 w-full justify-around">
            <ContractChip label="All" active={contract === 'all'} onClick={() => setContract('all')} />
            <ContractChip label="Short" active={contract === 'short'} onClick={() => setContract('short')} />
            <ContractChip label="Medium" active={contract === 'medium'} onClick={() => setContract('medium')} />
            <ContractChip label="Long" active={contract === 'long'} onClick={() => setContract('long')} />
          </div>
        </div>

        {/* Content states */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-black/60"><Loader></Loader></div>
        )}
        {!!error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {!loading && !error && (
          filtered.length ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 w-full">
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
      className={`cursor-pointer px-4 py-2 rounded-2xl border ${active ? 'text-white bg-gradient-to-r from-orange-500 to-pink-600 border-0' : 'border-black/10 bg-white text-black'} transition-0.5s`}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-black/10 bg-white w-full">
      <div className="text-4xl">💼</div>
      <h3 className="mt-2 text-lg font-semibold">No vacancies now</h3>
      <p className="mt-1 text-black/60">Subscribe and stay tuned with CASTPOINT</p>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="text-sm text-black/60">
            {job.company_name}{job.location ? ` · ${job.location}` : ''}
          </p>
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
        <div>
          <p className={`mt-3 text-sm text-black/80 ${!expanded ? 'line-clamp-3' : ''}`}>
            {job.description}
          </p>
          <button
            type="button"
            disabled={!user}
            onClick={() => {
              if (!user) return;
              setExpanded((v) => !v);
            }}
            className={`mt-1 text-sm font-semibold ${user ? "text-orange-600 cursor-pointer" : "text-orange-400 cursor-not-allowed"
              }`}
          >
            {!user ? <a href='/login'>Login to read more </a>: expanded ? "Show less" : "Read more"}
          </button>

        </div>
      )}

      <div className="mt-4 flex gap-2 align self-end">
        <button disabled={!user} onClick={() => setOpen(true)} className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-2 rounded-3xl uppercase cursor-pointer">
          {!user ? <a href='/login'>Login to Apply</a> : "Apply Now"}
        </button>
      </div>

      <AnimatePresence>
        {open &&
          <ApplyModal
            jobId={job.id}
            onClose={() => setOpen(false)}
            jobTitle={job.title}
          />}
      </AnimatePresence>
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

// function ApplyModal({ jobId, onClose }: { jobId: number; onClose: () => void }) {
//   const { user } = useAuth();
//   const [form, setForm] = useState({
//     full_name: user?.name,
//     date_of_birth: user?.date_of_birth || '',
//     email: user?.email,
//     phone: user?.phone || '',
//     instagram: user?.instagram || '',
//     country: user?.country_of_birth || '',
//     cover_message: '',
//     weight: user?.weight || '',
//     height: user?.height || '',
//     experience: user?.experience || '',
//     biography: user?.biography || '',
//     cv_url: user?.resume_url || '',
//     promo_url: user?.video_url || '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

//   const handle = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
//   const [finallyMsg, setFinallyMsg] = useState('');

//   const submit = async () => {
//     console.log('submit', form);

//     try {
//       setLoading(true);
//       setStatus('idle');
//       const res = await fetch('/api/apply', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           job_id: jobId,
//           artist: {
//             full_name: form.full_name,
//             date_of_birth: form.date_of_birth,
//             email: form.email,
//             phone: form.phone || undefined,
//             instagram: form.instagram || undefined,
//             country: form.country || undefined,
//             height: form.height || undefined,
//             weight: form.weight || undefined,
//             experience: form.experience || undefined,
//             biography: form.biography || undefined,
//             picture: user?.pic_url || undefined,
//           },
//           cover_message: form.cover_message,
//           cv_url: form.cv_url || undefined,
//           promo_url: form.promo_url || undefined,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok || data?.ok === false) throw new Error(data?.error || 'Failed');
//       setStatus('ok');
//     } catch (error) {
//       setStatus(error instanceof Error ? 'err' : 'err');
//     } finally {
//       setFinallyMsg('Done! Wish you luck and our team is waiting for your future job!')
//       setLoading(false);
//       setTimeout(() => {
//         onClose();
//       }, 5000);
//     };
//   }

//   return (
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
//       {finallyMsg ? (
//         <div
//           className="flex flex-col gap-3 relative w-full max-w-xl rounded-2xl bg-white p-10 justify-center items-center"
//         >
//           <button onClick={onClose}
//             className="absolute right-3 top-3 text-black/60">✕</button>
//           <h3 className="mb-3 text-lg text-justify">{finallyMsg}</h3>
//         </div>
//       ) :
//         (<div className="flex flex-col gap-3 relative w-full max-w-xl rounded-2xl bg-white p-5">
//           <button onClick={onClose} className="absolute right-3 top-3 text-black/60 cursor-pointer">✕</button>
//           <h3 className="mb-3 text-lg font-semibold">Apply</h3>
//           <p>Your CV will be generated automatically and sent to the employer along with your profile details.</p>
//           <p>Just press the button below to send it. If you want, you can add a short message or any extra information.</p>
//           <p>You can also attach up to 5 (five) photos of yourself.</p>
//           <p>Good luck with a future opportunities! You deserve it!</p>
//           <textarea name="cover_message" placeholder="A few words...." className="input min-h-28 border-1 p-3 rounded-2xl" onChange={handle} />
//           <button disabled={loading} onClick={submit} className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-3xl cursor-pointer uppercase flex items-center justify-center">
//             {loading ? <Loader /> : 'Apply'}
//           </button >
//           {status === 'ok' && (
//             <p className="text-sm text-green-600 flex justify-center text-center">Done! Wish you luck and our team is waiting for your future job!</p>
//           )}
//           {status === 'err' && (
//             <p className="text-sm text-red-600">Something went wrong! Try again later.</p>
//           )}
//         </div>)
//       }
//     </div>
//   );
// }
function ApplyModal({ jobId, onClose, jobTitle }: { jobId: number; onClose: () => void; jobTitle: string }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    full_name: user?.name || "",
    date_of_birth: user?.date_of_birth || "",
    email: user?.email || "",
    phone: user?.phone || "",
    instagram: user?.instagram || "",
    country: user?.country_of_birth || "",
    cover_message: "",
    weight: user?.weight || "",
    height: user?.height || "",
    experience: user?.experience || "",
    biography: user?.biography || "",
    promo_url: user?.video_url || "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [finallyMsg, setFinallyMsg] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // previews lifecycle
  useEffect(() => {
    // cleanup old
    previews.forEach((u) => URL.revokeObjectURL(u));
    const next = photos.map((f) => URL.createObjectURL(f));
    setPreviews(next);

    return () => {
      next.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  const onPickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Only images
    const imagesOnly = files.filter((f) => f.type.startsWith("image/"));

    // append but max 5
    setPhotos((prev) => {
      const merged = [...prev, ...imagesOnly];
      return merged.slice(0, 5);
    });

    // allow picking same file again
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    try {
      setLoading(true);
      setStatus("idle");

      const fd = new FormData();
      fd.append("job_id", String(jobId));

      // artist fields
      fd.append("artist_full_name", form.full_name);
      fd.append("artist_email", form.email);
      if (form.date_of_birth) fd.append("artist_date_of_birth", form.date_of_birth);
      if (form.phone) fd.append("artist_phone", form.phone);
      if (form.instagram) fd.append("artist_instagram", form.instagram);
      if (form.country) fd.append("artist_country", form.country);
      if (form.height) fd.append("artist_height", String(form.height));
      if (form.weight) fd.append("artist_weight", String(form.weight));
      if (form.experience) fd.append("artist_experience", form.experience);
      if (form.biography) fd.append("artist_biography", form.biography);
      if (user?.pic_url) fd.append("artist_picture", user.pic_url);

      // other
      fd.append("cover_message", form.cover_message || "");
      if (form.promo_url) fd.append("promo_url", form.promo_url);

      // photos (up to 5)
      photos.forEach((file) => {
        fd.append("photos", file); // same key -> array on backend
      });

      const res = await fetch("/api/apply", {
        method: "POST",
        body: fd, // IMPORTANT: no Content-Type header
      });

      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || "Failed");

      setStatus("ok");
      setFinallyMsg("Done! Wish you luck and our team is waiting for your future job!");
      setTimeout(() => onClose(), 5000);
    } catch (error) {
      setStatus(error instanceof Error ? "err" : "err");
    } finally {
      setLoading(false);
    }
  };

  const remaining = 5 - photos.length;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >

      {finallyMsg ? (
        <div className="flex flex-col gap-3 relative w-full max-w-xl rounded-2xl bg-white p-10 justify-center items-center">
          <button onClick={onClose} className="absolute right-3 top-3 text-black/60">✕</button>
          <h3 className="mb-3 text-lg text-justify">{finallyMsg}</h3>
        </div>
      ) : (
        <motion.div
          className={`relative flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-white p-10`}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <button onClick={onClose} className="absolute right-3 top-3 text-black/60 cursor-pointer">✕</button>

          <h3 className="mb-1 text-lg font-semibold">Apply for {jobTitle}</h3>
          <p>Your CV will be generated automatically and sent to the employer along with your profile details.</p>
          <p>Just press the button below to send it. If you want, you can add a short message or any extra information.</p>
          <p>You can also attach up to 5 (five) photos of yourself.</p>

          <textarea
            name="cover_message"
            placeholder="A few words...."
            className="input min-h-28 border-1 p-3 rounded-2xl"
            onChange={handle}
            value={form.cover_message}
          />

          {/* Photos picker */}
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-black/70">Photos ({photos.length}/5)</p>
              <label
                className={`text-sm px-3 py-2 rounded-xl border cursor-pointer ${remaining > 0 ? "border-black/20 hover:bg-black/5" : "border-black/10 text-black/40 cursor-not-allowed"
                  }`}
              >
                Add photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={remaining <= 0}
                  onChange={onPickPhotos}
                  className="hidden"
                />
              </label>
            </div>

            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {previews.map((src, idx) => (
                  <div key={src} className="relative aspect-square rounded-xl overflow-hidden border border-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`photo-${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-white/90 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-black/50">
              Tip: choose clear face / full body / stage shots. Images only. Max 5.
            </p>
          </div>

          <button
            disabled={loading}
            onClick={submit}
            className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-3xl cursor-pointer uppercase flex items-center justify-center"
          >
            {loading ? <Loader /> : "Apply"}
          </button>

          {status === "err" && (
            <p className="text-sm text-red-600">Something went wrong! Try again later.</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

