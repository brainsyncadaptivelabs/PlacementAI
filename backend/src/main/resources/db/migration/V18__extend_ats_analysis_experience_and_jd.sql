-- V18__extend_ats_analysis_experience_and_jd.sql safely

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ats_analysis') THEN
        ALTER TABLE ats_analysis DROP CONSTRAINT IF EXISTS uk_ats_analysis_resume_id;
        ALTER TABLE ats_analysis DROP CONSTRAINT IF EXISTS ats_analysis_resume_id_key;
        ALTER TABLE ats_analysis DROP CONSTRAINT IF EXISTS uk_resume_id;
        DROP INDEX IF EXISTS UK_ats_analysis_resume_id;
        DROP INDEX IF EXISTS uk_ats_analysis_resume_id;
        DROP INDEX IF EXISTS ats_analysis_resume_id_key;

        ALTER TABLE ats_analysis ADD COLUMN IF NOT EXISTS resume_id BIGINT;
        CREATE INDEX IF NOT EXISTS idx_ats_analysis_resume_id ON ats_analysis(resume_id);

        ALTER TABLE ats_analysis
            ADD COLUMN IF NOT EXISTS scan_type VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
            ADD COLUMN IF NOT EXISTS jd_text_snapshot TEXT,
            ADD COLUMN IF NOT EXISTS inferred_role VARCHAR(255),
            ADD COLUMN IF NOT EXISTS inferred_experience_level VARCHAR(50),
            ADD COLUMN IF NOT EXISTS inference_confidence DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS inference_reasoning TEXT,
            ADD COLUMN IF NOT EXISTS core_fit_score INT,
            ADD COLUMN IF NOT EXISTS full_jd_match_score INT,
            ADD COLUMN IF NOT EXISTS jd_inferred_level VARCHAR(50),
            ADD COLUMN IF NOT EXISTS level_gap_detected BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS growth_areas JSONB,
            ADD COLUMN IF NOT EXISTS candidate_override_level VARCHAR(50);
    END IF;
END $$;
