// src/components/home/JobBox.tsx
'use client';

import Link from 'next/link';
import { Job } from '../../utils/Types';


export default function JobBox({ job }: { job: Job }) {
  return (
    <li className="rounded-xl border border-orange-300 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-lg font-semibold leading-tight">
          {job.title}
        </h4>
        {/* статус / тип договору якщо є */}
        {job.contract_type && (
          <span className="shrink-0 rounded-full border border-orange-400 px-2 py-0.5 text-xs">
            {job.contract_type}
          </span>
        )}
      </div>

      <p className="mt-1 text-sm">
        {job.company_name}
        {job.location ? ` • ${job.title}` : ''}
      </p>

      {/* короткий опис, якщо є */}
      {job.description && (
        <p className="mt-2 line-clamp-3 text-sm text-neutral-700">{job.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between text-sm text-neutral-600">
        {job.salary_from || job.salary_to ? (
          <span>
            {job.salary_from ? `$${job.salary_from}` : ''}{job.salary_to ? `–$${job.salary_to}` : ''} / {job.currency || 'USD'}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/jobs/${job.id}`}
          className="w-full rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 px-4 py-2 text-center text-white"
        >
          View
        </Link>
      </div>
    </li>
  );
}
