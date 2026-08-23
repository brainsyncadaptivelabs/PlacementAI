-- Flyway migration V17: Asynchronous Judge0 State Machine and Telemetry safely

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coding_submissions') THEN
        ALTER TABLE coding_submissions
            ADD COLUMN IF NOT EXISTS execution_state VARCHAR(30) DEFAULT 'QUEUED',
            ADD COLUMN IF NOT EXISTS version INT DEFAULT 0;

        CREATE INDEX IF NOT EXISTS idx_coding_submissions_state
            ON coding_submissions (execution_state);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coding_executions') THEN
        ALTER TABLE coding_executions
            ADD COLUMN IF NOT EXISTS judge0_token VARCHAR(64),
            ADD COLUMN IF NOT EXISTS execution_state VARCHAR(30) DEFAULT 'QUEUED',
            ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        CREATE UNIQUE INDEX IF NOT EXISTS idx_coding_executions_judge0_token
            ON coding_executions (judge0_token)
            WHERE judge0_token IS NOT NULL;

        CREATE INDEX IF NOT EXISTS idx_coding_executions_state_updated
            ON coding_executions (execution_state, updated_at);
    END IF;
END $$;
