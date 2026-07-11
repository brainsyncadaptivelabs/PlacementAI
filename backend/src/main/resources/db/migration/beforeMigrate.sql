-- Flyway Callback: beforeMigrate.sql
-- Production-safe environment detection callback.
-- This script inspects the database to check if the Supabase auth schema exists.
-- It NEVER attempts to create or modify the auth schema, auth.users table, or flyway_schema_history.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname = 'auth'
    ) THEN
        RAISE NOTICE '[ENVIRONMENT_DETECTION] Supabase auth schema detected. Supabase-specific features are active.';
    ELSE
        RAISE NOTICE '[ENVIRONMENT_DETECTION] Supabase auth schema is NOT present. Running in standard/local PostgreSQL mode.';
    END IF;
END $$;
