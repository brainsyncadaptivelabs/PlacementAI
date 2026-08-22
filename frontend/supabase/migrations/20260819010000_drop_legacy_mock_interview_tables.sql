-- Supabase Migration: Drop legacy mock-interview tables using RESTRICT in child-to-parent order

DROP TABLE IF EXISTS mock_interview_snapshots RESTRICT;
DROP TABLE IF EXISTS interview_feedback RESTRICT;
DROP TABLE IF EXISTS interview_questions RESTRICT;
DROP TABLE IF EXISTS ai_observability_logs RESTRICT;
DROP TABLE IF EXISTS mock_interviews RESTRICT;
