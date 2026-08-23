-- Flyway Migration V16: Add missing candidate contradiction observability and review status fields safely

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_contradictions') THEN
        ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS confidence_threshold DOUBLE PRECISION DEFAULT 0.6;
        ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS reason_trace TEXT;
        ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW';
    END IF;
END $$;
