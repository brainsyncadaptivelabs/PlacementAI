-- ===========================================================================
-- PRODUCTION DATABASE SCHEMA DRIFT FIX MIGRATION
-- ===========================================================================
-- Safely and idempotently adds missing score and helper columns to the 'users' table
-- to resolve Hibernate schema drift failures during application startup.
-- ===========================================================================

-- 1. Score Columns (Integer, NOT NULL, DEFAULT 0)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ats_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coding_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interview_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS communication_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS readiness_score INTEGER NOT NULL DEFAULT 0;

-- 2. Credits & Account Management Columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_remaining INTEGER NOT NULL DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_used INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- 3. Delete Locking Columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS delete_lock_expires_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS delete_failed_attempts INTEGER NOT NULL DEFAULT 0;

-- 4. Aptitude Data Column
ALTER TABLE users ADD COLUMN IF NOT EXISTS aptitude_data TEXT;
