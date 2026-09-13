-- V19: Add user feature usage tracking
CREATE TABLE IF NOT EXISTS user_feature_usages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255),
    feature_key VARCHAR(50) NOT NULL,
    used_count DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_feature_usages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_feature_period UNIQUE (user_id, feature_key, period_start),
    CONSTRAINT chk_user_feature_usages_used_count CHECK (used_count >= 0.0)
);

CREATE INDEX IF NOT EXISTS idx_user_feature_usage_user ON user_feature_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_feature ON user_feature_usages(user_id, feature_key);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_period ON user_feature_usages(period_end);
