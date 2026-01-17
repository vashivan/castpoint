'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import ReviewBox from './ReviewBox';
import JobBox from './JobBox';
import { Review, Job } from '../../utils/Types';

export default function AuthenticatedHome() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError,   setJobsError]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/get_reviews")
      .then((res) => res.json())
      .then((data) => {
        const transformedReviews = data.map((u: Review) => ({
          id: u.id,
          artist_id: u.artist_id,
          artist_name: u.artist_name,
          artist_instagram: u.artist_instagram,
          content: u.content,
          company_name: u.company_name,
          position: u.position,
          place_of_work: u.place_of_work,
          created_at: u.created_at,
        }));
        setReviews(transformedReviews);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  // === jobs fetch (аналогічно reviews) ===
  // useEffect(() => {
  //   setJobsLoading(true);
  //   setJobsError(null);

  //   fetch('/api/jobs')
  //     .then((res) => {
  //       if (!res.ok) throw new Error(`Jobs: ${res.status}`);
  //       return res.json();
  //     })
  //     .then((data: Job[]) => {
  //       // За потреби трансформуємо під ваш тип
  //       const normalized = data.map((j: Job) => ({
  //         id: j.id,
  //         title: j.title,
  //         company_name: j.company_name,
  //         location: j.location,      // якщо є
  //         description: j.description,
  //         salary_from: (j as any).salary_from,
  //         salary_to: (j as any).salary_to,
  //         currency: (j as any).currency,
  //         contract_type: (j as any).contract_type,
  //       })) as Job[];
  //       setJobs(normalized);
  //     })
  //     .catch((e) => setJobsError(e.message))
  //     .finally(() => setJobsLoading(false));
  // }, []);
  // усередині AuthenticatedHome()

useEffect(() => {
  (async () => {
    setJobsLoading(true);
    setJobsError(null);

    try {
      const res = await fetch('/api/jobs', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Jobs HTTP ${res.status}`);

      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error('Jobs: response is not JSON');
      }

      const raw = await res.json();

      // Нормалізуємо у масив на будь-який випадок
      const arr: any[] =
        Array.isArray(raw) ? raw
        : Array.isArray(raw?.jobs) ? raw.jobs
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.items) ? raw.items
        : (raw && typeof raw === 'object') ? [raw]
        : [];

      if (!Array.isArray(arr)) throw new Error('Jobs: not an array');

      const normalized = arr.map((j: any) => ({
        id: j.id,
        title: j.title,
        company_name: j.company_name,
        place_of_work: j.place_of_work,
        country: j.country,
        city: j.city,
        description: j.description,
        salary_from: j.salary_from,
        salary_to: j.salary_to,
        currency: j.currency,
        contract_type: j.contract_type,
        created_at: j.created_at,
      }));

      normalized.sort((a, b) =>
        (new Date(b.created_at || 0).getTime()) -
        (new Date(a.created_at || 0).getTime())
      );

      setJobs(normalized);
    } catch (e: any) {
      console.error('Jobs load error:', e);
      setJobsError(e?.message || 'Unknown error');
      setJobs([]); // щоб не падало .map
    } finally {
      setJobsLoading(false);
    }
  })();
}, []);


  const getLastN = <T,>(arr: T[]): T[] => arr.slice(0, 5);

  const shortReviews = getLastN(reviews);
  const shortJobs    = getLastN(jobs);

  const setAvatar = () => {
    const avatars = {
      1: '/default-avatar.png',
      2: '/default-avatar2.png',
      3: '/default-avatar3.png',
      4: '/default-avatar4.png',
      5: '/default-avatar5.png',
      6: '/default-avatar6.png',
      7: '/default-avatar7.png'
    };
    const randomIndex = Math.floor(Math.random() * Object.keys(avatars).length) + 1;
    return avatars[randomIndex as keyof typeof avatars]
  }

  return (
    <div className="min-h-screen px-15 py-20 bg-transparent text-black">
      <h2 className="mb-10 text-center text-3xl">Welcome back, {user?.name} 👋</h2>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-6">

        {/* New Job Offers */}
        <div className="col-span-4 row-span-7 md:col-span-3 rounded-2xl border border-orange-500 bg-white/70 p-6 max-h-120 overflow-auto">
          <h3 className="mb-3 text-2xl font-semibold">🧾 New Job Offers</h3>

          {/* loading / error / empty */}
          {jobsLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-white/60" />
              ))}
            </div>
          )}

          {!jobsLoading && jobsError && (
            <p className="text-sm text-red-600">Failed to load jobs: {jobsError}</p>
          )}

          {!jobsLoading && !jobsError && shortJobs.length === 0 && (
            <p className="text-sm text-neutral-700">No new jobs yet. Check back soon!</p>
          )}

          {!jobsLoading && !jobsError && shortJobs.length > 0 && (
            <ol className="flex flex-col gap-4">
              {shortJobs.map((job) => (
                <JobBox key={job.id} job={job} />
              ))}
            </ol>
          )}

          <Link
            href="/vacancies"
            className="mt-4 block w-full rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-2 text-center text-white"
          >
            View all
          </Link>
        </div>

        {/* Latest Blog Posts */}
        <div className="col-span-4 row-span-7 md:col-span-3 rounded-2xl border border-orange-500 bg-white/70 p-6">
          <h3 className="mb-3 text-2xl font-semibold">📰 Latest Blog Posts</h3>
          <p className="text-white/70">Latest blog post previews here</p>
        </div>

        {/* Feedback on Applications */}
        <div className="col-span-4 row-span-5 md:col-span-2 max-h-120 overflow-scroll rounded-2xl border border-orange-500 bg-white/70 p-6">
          <h3 className="mb-2 text-xl font-semibold">💬 Latest feedback</h3>
          <ol className="flex flex-col gap-4">
            {shortReviews.map((r) => (
              <ReviewBox key={r.id} review={r} />
            ))}
          </ol>
          <Link
            href="/reviews"
            className="mt-4 block w-full rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-2 text-center text-white"
          >
            View all
          </Link>
        </div>

        {/* Go to Profile */}
        <div className="col-span-4 row-span-5 md:col-span-2 flex w-full max-h-120 flex-col justify-between overflow-y-scroll rounded-2xl border border-orange-500 bg-white/70 p-6 text-black">
          <h3 className="mb-4 text-xl font-bold">👤 My Profile</h3>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl">{`${user?.first_name} ${user?.second_name}`}</h1>
            <h2>{user?.country}</h2>
            <img
              src={user?.pic_url || setAvatar()}
              alt="Profile"
              className="my-3 h-40 w-40 rounded-xl object-cover"
            />
            <p className="my-3 text-justify">{user?.biography}</p>
            <p className="my-3 text-justify">{user?.experience}</p>
          </div>
          <a
            href="/profile"
            className="mt-auto w-full cursor-pointer rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-2 text-center text-white"
          >
            View Profile
          </a>
        </div>

        <div className="col-span-4 row-span-5 md:col-span-2 w-full rounded-2xl border border-orange-500 bg-white/70 p-6 text-black">
          <h3 className="mb-4 text-xl font-bold">My applications</h3>
        </div>
      </div>
    </div>
  );
}
