-- V24__add_program_of_day_and_coding_rewards.sql
-- Persistence tables for Program of the Day, Coding Streak, and Coding Reward entitlement system

CREATE TABLE IF NOT EXISTS program_of_day (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,
    assigned_date DATE NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pod_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pod_problem FOREIGN KEY (problem_id) REFERENCES coding_problems(id) ON DELETE CASCADE,
    CONSTRAINT uk_pod_user_assigned_date UNIQUE (user_id, assigned_date)
);

CREATE INDEX IF NOT EXISTS idx_pod_user_status ON program_of_day (user_id, status);

CREATE TABLE IF NOT EXISTS coding_streaks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_completed_date DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_streak_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_streak_user_last_date ON coding_streaks (user_id, last_completed_date);

CREATE TABLE IF NOT EXISTS coding_rewards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'STREAK_7_DAY',
    streak_length INT NOT NULL DEFAULT 7,
    status VARCHAR(20) NOT NULL DEFAULT 'UNLOCKED',
    unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    claimed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reward_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_reward_user_type_streak UNIQUE (user_id, reward_type, streak_length)
);

CREATE INDEX IF NOT EXISTS idx_reward_user_status ON coding_rewards (user_id, status);
