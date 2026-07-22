-- Flyway Migration V15: Harden Observability and Contradiction Safety Gating

-- Add new observability fields to api_usage_logs
ALTER TABLE api_usage_logs ADD COLUMN IF NOT EXISTS prompt_version VARCHAR(255);
ALTER TABLE api_usage_logs ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Add new fields to candidate_contradictions
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS evidence TEXT;
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS matched_resume_section TEXT;
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS matched_interview_answer TEXT;
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION;
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS status VARCHAR(255);
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITHOUT TIME ZONE;
