-- ===========================================================================
-- Flyway Migration V7: PRODUCTION DATABASE SCHEMA DRIFT & NULL BACKFILL FIX
-- ===========================================================================
-- Safely and idempotently alters users table to add missing scores, backfill
-- existing null rows, and enforce required default and NOT NULL constraints.
-- ===========================================================================

-- 1. Ensure columns exist (nullable first)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ats_score INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coding_score INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interview_score INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS communication_score INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS readiness_score INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS delete_failed_attempts INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_remaining INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_used INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS delete_lock_expires_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aptitude_data TEXT;

-- 2. Populate default values for existing rows containing NULL
UPDATE users SET ats_score = 0 WHERE ats_score IS NULL;
UPDATE users SET coding_score = 0 WHERE coding_score IS NULL;
UPDATE users SET interview_score = 0 WHERE interview_score IS NULL;
UPDATE users SET communication_score = 0 WHERE communication_score IS NULL;
UPDATE users SET readiness_score = 0 WHERE readiness_score IS NULL;
UPDATE users SET delete_failed_attempts = 0 WHERE delete_failed_attempts IS NULL;
UPDATE users SET credits_remaining = 100 WHERE credits_remaining IS NULL;
UPDATE users SET credits_used = 0 WHERE credits_used IS NULL;
UPDATE users SET welcome_email_sent = FALSE WHERE welcome_email_sent IS NULL;

-- 3. Apply default values and NOT NULL constraints to existing columns
ALTER TABLE users ALTER COLUMN ats_score SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN ats_score SET NOT NULL;

ALTER TABLE users ALTER COLUMN coding_score SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN coding_score SET NOT NULL;

ALTER TABLE users ALTER COLUMN interview_score SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN interview_score SET NOT NULL;

ALTER TABLE users ALTER COLUMN communication_score SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN communication_score SET NOT NULL;

ALTER TABLE users ALTER COLUMN readiness_score SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN readiness_score SET NOT NULL;

ALTER TABLE users ALTER COLUMN delete_failed_attempts SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN delete_failed_attempts SET NOT NULL;

ALTER TABLE users ALTER COLUMN credits_remaining SET DEFAULT 100;
ALTER TABLE users ALTER COLUMN credits_remaining SET NOT NULL;

ALTER TABLE users ALTER COLUMN credits_used SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN credits_used SET NOT NULL;

ALTER TABLE users ALTER COLUMN welcome_email_sent SET DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN welcome_email_sent SET NOT NULL;
