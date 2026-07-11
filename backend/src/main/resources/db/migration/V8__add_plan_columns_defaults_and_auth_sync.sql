-- Flyway Migration V8: Synchronize plan and payment columns, defaults, drop redundant indexes, create foreign key indexes, and safely backfill Supabase auth profiles.

-- 1. Ensure plan and payment columns exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_selected BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_uuid UUID;

-- 2. Populate default values for existing rows to avoid NULLs
UPDATE users SET plan = 'FREE' WHERE plan IS NULL;
UPDATE users SET payment_status = 'COMPLETED' WHERE payment_status IS NULL;
UPDATE users SET plan_selected = TRUE WHERE plan_selected IS NULL;
UPDATE users SET payment_completed = TRUE WHERE payment_completed IS NULL;

-- 3. Set NOT NULL and DEFAULT constraints on plan and payment columns
ALTER TABLE users ALTER COLUMN plan SET DEFAULT 'FREE';
ALTER TABLE users ALTER COLUMN plan SET NOT NULL;

ALTER TABLE users ALTER COLUMN payment_status SET DEFAULT 'COMPLETED';
ALTER TABLE users ALTER COLUMN payment_status SET NOT NULL;

ALTER TABLE users ALTER COLUMN plan_selected SET DEFAULT TRUE;
ALTER TABLE users ALTER COLUMN plan_selected SET NOT NULL;

ALTER TABLE users ALTER COLUMN payment_completed SET DEFAULT TRUE;
ALTER TABLE users ALTER COLUMN payment_completed SET NOT NULL;

-- 4. Unique constraint on supabase_uuid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_supabase_uuid_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_supabase_uuid_key UNIQUE (supabase_uuid);
    END IF;
END $$;

-- 5. Foreign Key reference from users(supabase_uuid) to auth.users(id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname = 'auth'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_supabase_auth'
    ) THEN
        EXECUTE 'ALTER TABLE users ADD CONSTRAINT fk_users_supabase_auth FOREIGN KEY (supabase_uuid) REFERENCES auth.users(id) ON DELETE SET NULL';
    END IF;
END $$;

-- 6. Synchronize default constraints for existing columns in public.users to match Lombok defaults
ALTER TABLE users ALTER COLUMN profile_completed SET DEFAULT FALSE;
UPDATE users SET profile_completed = FALSE WHERE profile_completed IS NULL;
ALTER TABLE users ALTER COLUMN profile_completed SET NOT NULL;

ALTER TABLE users ALTER COLUMN auto_save SET DEFAULT TRUE;
UPDATE users SET auto_save = TRUE WHERE auto_save IS NULL;
ALTER TABLE users ALTER COLUMN auto_save SET NOT NULL;

ALTER TABLE users ALTER COLUMN email_notifications SET DEFAULT TRUE;
UPDATE users SET email_notifications = TRUE WHERE email_notifications IS NULL;
ALTER TABLE users ALTER COLUMN email_notifications SET NOT NULL;

ALTER TABLE users ALTER COLUMN push_notifications SET DEFAULT FALSE;
UPDATE users SET push_notifications = FALSE WHERE push_notifications IS NULL;
ALTER TABLE users ALTER COLUMN push_notifications SET NOT NULL;

ALTER TABLE users ALTER COLUMN profile_visible SET DEFAULT TRUE;
UPDATE users SET profile_visible = TRUE WHERE profile_visible IS NULL;
ALTER TABLE users ALTER COLUMN profile_visible SET NOT NULL;

ALTER TABLE users ALTER COLUMN two_factor_enabled SET DEFAULT FALSE;
UPDATE users SET two_factor_enabled = FALSE WHERE two_factor_enabled IS NULL;
ALTER TABLE users ALTER COLUMN two_factor_enabled SET NOT NULL;

ALTER TABLE users ALTER COLUMN language SET DEFAULT 'en';
UPDATE users SET language = 'en' WHERE language IS NULL;
ALTER TABLE users ALTER COLUMN language SET NOT NULL;

-- 7. Drop Redundant Indexes
DROP INDEX IF EXISTS idx_user_email;
DROP INDEX IF EXISTS idx_signup_email;

-- 8. Create Critical Missing Indexes for Performance Tuning
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_student_id ON job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_student_id ON interview_schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_recruiter_id ON interview_schedules(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_question_id ON coding_submissions(interview_question_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_problem_id ON coding_submissions(coding_problem_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_mock_interview_id ON interview_questions(mock_interview_id);

-- 9. Idempotent Supabase Auth Synchronization with Operational Logging
-- Match existing users by email first to populate supabase_uuid using dynamic SQL to prevent syntax errors when auth schema doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname = 'auth'
    ) THEN
        EXECUTE 'UPDATE users u SET supabase_uuid = au.id FROM auth.users au WHERE LOWER(u.email) = LOWER(au.email) AND u.supabase_uuid IS NULL';
    END IF;
END $$;

-- PL/pgSQL block to identify, log, and sync orphaned auth.users
DO $$
DECLARE
    r RECORD;
    new_user_id BIGINT;
    inserted_count INT := 0;
    skipped_count INT := 0;
    conflict_count INT := 0;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname = 'auth'
    ) THEN
        RAISE NOTICE '[AUTH_SYNC] Starting synchronization between auth.users and public.users...';
        
        FOR r IN 
            EXECUTE '
                SELECT 
                    au.id AS auth_id, 
                    au.email, 
                    COALESCE(au.raw_user_meta_data->>''full_name'', split_part(au.email, ''@'', 1)) AS full_name
                FROM auth.users au'
        LOOP
            -- Check if user already exists in public.users (by supabase_uuid or email)
            IF EXISTS (SELECT 1 FROM users WHERE supabase_uuid = r.auth_id) THEN
                skipped_count := skipped_count + 1;
                RAISE NOTICE '[AUTH_SYNC] Skipped (UUID already synchronized): email=%', r.email;
            ELSIF EXISTS (SELECT 1 FROM users WHERE LOWER(email) = LOWER(r.email)) THEN
                -- Email exists but supabase_uuid is null: update the UUID
                UPDATE users SET supabase_uuid = r.auth_id WHERE LOWER(email) = LOWER(r.email);
                conflict_count := conflict_count + 1;
                RAISE WARNING '[AUTH_SYNC] Updated existing profile with UUID: email=%', r.email;
            ELSE
                -- Create a new user profile
                INSERT INTO users (
                    email, password, full_name, role, auth_provider, email_verified, 
                    account_status, profile_completed, created_at, updated_at, 
                    readiness_score, ats_score, coding_score, interview_score, communication_score,
                    delete_failed_attempts, credits_remaining, credits_used, welcome_email_sent, supabase_uuid
                ) VALUES (
                    r.email,
                    '$2a$12$6jjqI5BMAs9e9XUNEX4zserwB2e0sPykaQYuv5NqlcOEQFB2cii8i', -- Default secure dummy password hash
                    r.full_name,
                    'STUDENT',
                    'GOOGLE',
                    TRUE,
                    'ACTIVE',
                    FALSE,
                    NOW(),
                    NOW(),
                    0, 0, 0, 0, 0, 0, 100, 0, FALSE,
                    r.auth_id
                ) RETURNING id INTO new_user_id;
                
                -- Insert corresponding user_stats record
                INSERT INTO user_stats (user_id, activity_streak_days, questions_easy, questions_medium, questions_hard, resume_verified)
                VALUES (new_user_id, 0, 0, 0, 0, FALSE);
                
                inserted_count := inserted_count + 1;
                RAISE NOTICE '[AUTH_SYNC] Created user profile: email=%', r.email;
            END IF;
        END LOOP;
        
        RAISE NOTICE '[AUTH_SYNC] Sync complete. Inserted: %, Skipped: %, Updated/Conflicts: %', inserted_count, skipped_count, conflict_count;
    ELSE
        RAISE NOTICE '[AUTH_SYNC] Skipping auth.users synchronization (auth schema is not present).';
    END IF;
END $$;
