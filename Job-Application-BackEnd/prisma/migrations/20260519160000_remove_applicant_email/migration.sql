-- Email is stored only on Account; Applicant.email was redundant.
DROP INDEX IF EXISTS "Applicant_email_key";

ALTER TABLE "Applicant" DROP COLUMN IF EXISTS "email";
