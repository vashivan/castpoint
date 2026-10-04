import type { Job } from "@/utils/Types";

/** Who the employer is looking for. `value` is stored in jobs.discipline. */
export const DISCIPLINES = [
  { value: "dance", label: "Dance" },
  { value: "vocal", label: "Vocal" },
  { value: "circus", label: "Circus" },
  { value: "aerial", label: "Aerial" },
  { value: "music", label: "Music" },
  { value: "variety", label: "Variety" },
  { value: "choreo", label: "Choreo" },
] as const;

export type Discipline = (typeof DISCIPLINES)[number]["value"];

export function disciplineLabel(value?: string | null) {
  return DISCIPLINES.find((d) => d.value === value)?.label ?? null;
}

const CONTRACT_LABEL: Record<string, string> = {
  short: "Short term",
  medium: "Medium term",
  long: "Long term",
};

/** Old enum kept in the DB for older jobs and filters: derived from months. */
export function contractTypeFromMonths(months: number): "short" | "medium" | "long" {
  if (months <= 3) return "short";
  if (months <= 9) return "medium";
  return "long";
}

/** "12+ months", "6 months", or the old short/medium/long label for older jobs. */
export function contractLabel(job: Pick<Job, "contract_type" | "contract_months" | "contract_extendable">) {
  const months = Number(job.contract_months);
  if (months > 0) {
    return `${months}${job.contract_extendable ? "+" : ""} ${months === 1 && !job.contract_extendable ? "month" : "months"}`;
  }
  return job.contract_type ? CONTRACT_LABEL[job.contract_type] ?? job.contract_type : "—";
}

/** "1500–2500 USD", or null when the employer did not set a fee. */
export function salaryLabel(job: Pick<Job, "salary_from" | "salary_to" | "currency">) {
  const from = job.salary_from ? Math.round(Number(job.salary_from)) : null;
  const to = job.salary_to ? Math.round(Number(job.salary_to)) : null;
  if (!from && !to) return null;
  const cur = job.currency || "USD";
  if (from && to) return `${from}–${to} ${cur}`;
  return `${from ?? to} ${cur}`;
}

export function jobHref(job: Pick<Job, "id">) {
  return `/vacancies/${job.id}`;
}
