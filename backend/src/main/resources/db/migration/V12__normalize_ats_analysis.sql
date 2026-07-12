-- V12: Normalize ATS Analysis schema for production scoring
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS analysis_version VARCHAR(50) DEFAULT '1.0';
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS engine_version VARCHAR(50) DEFAULT '1.0';
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS prompt_version VARCHAR(50) DEFAULT '1.0';
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS kb_version VARCHAR(50) DEFAULT '1.0';
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS career_domain VARCHAR(255);
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS profession VARCHAR(255);
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50);
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS overall_readiness INTEGER;
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS target_role VARCHAR(255);
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS raw_json TEXT;
ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS resume_hash VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_ats_analysis_resume_hash ON ats_analysis(resume_hash);
