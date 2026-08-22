-- Supabase Migration: Drop legacy foreign key constraints and columns from coding_problems and coding_submissions
-- Executed prior to 20260819010000_drop_legacy_mock_interview_tables.sql so RESTRICT drops do not fail on foreign key dependencies.

-- 1. Drop FK constraints and column from coding_problems (referencing mock_interviews)
ALTER TABLE IF EXISTS coding_problems DROP CONSTRAINT IF EXISTS fk_coding_problems_mock_interview;
ALTER TABLE IF EXISTS coding_problems DROP CONSTRAINT IF EXISTS coding_problems_mock_interview_id_fkey;
ALTER TABLE IF EXISTS coding_problems DROP COLUMN IF EXISTS mock_interview_id;

-- 2. Drop FK constraints and column from coding_submissions (referencing interview_questions)
ALTER TABLE IF EXISTS coding_submissions DROP CONSTRAINT IF EXISTS fk_coding_submissions_interview_question;
ALTER TABLE IF EXISTS coding_submissions DROP CONSTRAINT IF EXISTS coding_submissions_interview_question_id_fkey;
ALTER TABLE IF EXISTS coding_submissions DROP COLUMN IF EXISTS interview_question_id;
