-- V25: Add performance and concurrency indexes for high-traffic query paths
-- Specifically targets user lookup, recruiter candidate search, ATS history queries,
-- job application status filtering, and coding problem submission counts.

DO $$
BEGIN
    -- Composite index for user role and account status filtering (Admin & Recruiter searches)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, account_status);
        CREATE INDEX IF NOT EXISTS idx_users_college_branch ON users(college_name, branch);
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    END IF;

    -- Composite index on ATS analysis for rapid user scan history sorted by date
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ats_analysis') THEN
        CREATE INDEX IF NOT EXISTS idx_ats_analysis_user_created ON ats_analysis(user_id, created_at DESC);
    END IF;

    -- Composite index on job applications for recruiter pipeline status filtering
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_applications') THEN
        CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON job_applications(job_id, status);
    END IF;

    -- Composite index on coding submissions for problem acceptance rollup stats
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coding_submissions') THEN
        CREATE INDEX IF NOT EXISTS idx_coding_submissions_problem_status ON coding_submissions(coding_problem_id, status);
    END IF;
END $$;
