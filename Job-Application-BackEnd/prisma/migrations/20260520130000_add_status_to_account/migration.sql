-- Add status field to Account model
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';