-- Add cgpa and exitExamScore to Education table (they were only added to Applicant previously)

ALTER TABLE "Education" ADD COLUMN IF NOT EXISTS "cgpa" DOUBLE PRECISION;
ALTER TABLE "Education" ADD COLUMN IF NOT EXISTS "exitExamScore" DOUBLE PRECISION;