-- Who the employer is looking for, and contract length in months.
-- contract_type (short/medium/long) stays and is now filled from contract_months.

ALTER TABLE jobs
  ADD COLUMN discipline VARCHAR(20) NULL AFTER contract_type,
  ADD COLUMN contract_months TINYINT UNSIGNED NULL AFTER discipline,
  ADD COLUMN contract_extendable TINYINT(1) NOT NULL DEFAULT 0 AFTER contract_months,
  ADD INDEX idx_jobs_discipline (discipline);

-- Allowed discipline values (checked in the app, src/lib/jobFormat.ts):
-- dance, vocal, circus, aerial, music, variety, choreo
