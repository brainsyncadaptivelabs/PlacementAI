-- V20: Analytics indexes and query optimization for feature usage tracking
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_key_count ON user_feature_usages(feature_key, used_count);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_lookup ON user_feature_usages(user_id, feature_key, period_end, used_count);
