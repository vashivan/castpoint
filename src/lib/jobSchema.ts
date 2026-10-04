// Validation for the job fields added with the discipline / months redesign.
// Columns (see db/migrations/2026-10-04_jobs_discipline_months.sql):
//   jobs.discipline VARCHAR(20), jobs.contract_months TINYINT UNSIGNED,
//   jobs.contract_extendable TINYINT(1)
import { z } from "zod";
import { DISCIPLINES } from "./jobFormat";

const values = DISCIPLINES.map((d) => d.value) as [string, ...string[]];

export const disciplineSchema = z.enum(values);
export const contractMonthsSchema = z.coerce.number().int().min(1).max(60);
export const contractExtendableSchema = z
  .union([z.boolean(), z.literal(0), z.literal(1)])
  .transform((v) => (v ? 1 : 0));

export const isDiscipline = (v: unknown): v is string => typeof v === "string" && values.includes(v);
