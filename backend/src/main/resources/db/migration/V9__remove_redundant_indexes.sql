-- Flyway Migration V9: Drop verified duplicate indexes that are already covered by unique constraints.

DROP INDEX IF EXISTS idx_admin_email;
DROP INDEX IF EXISTS idx_admin_session_token;
DROP INDEX IF EXISTS idx_email_verification_email;
DROP INDEX IF EXISTS idx_analytics_snapshot_date;
