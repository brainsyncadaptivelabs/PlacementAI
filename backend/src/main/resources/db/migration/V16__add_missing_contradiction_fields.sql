-- Flyway Migration V16: Add missing candidate contradiction observability and review status fields

ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS confidence_threshold DOUBLE PRECISION DEFAULT 0.6;
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS reason_trace TEXT;
ALTER TABLE candidate_contradictions ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW';
