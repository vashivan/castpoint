import Link from "next/link";
import { Tag } from "../ds/primitives";
import { contractLabel, disciplineLabel, jobHref, salaryLabel } from "@/lib/jobFormat";
import type { Job } from "@/utils/Types";

export default function ContractRow({ job, isNew = false }: { job: Job; isNew?: boolean }) {
  return (
    <li>
      <Link href={jobHref(job)} className="group flex items-center gap-5 border-b-[1.5px] border-ink py-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-[clamp(18px,2.2vw,28px)] leading-[0.95]">{job.title}</p>
            {isNew && <Tag tone="lime">New</Tag>}
          </div>
          <p className="mt-1.5 truncate text-[14px] text-ink/70">
            {[disciplineLabel(job.discipline), job.company_name, job.location, salaryLabel(job)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="hidden w-32 text-[15px] sm:block">{contractLabel(job)}</span>
        <span className="grid h-14 w-14 shrink-0 place-items-center border-[1.5px] border-ink text-xl group-hover:bg-lime">→</span>
      </Link>
    </li>
  );
}
