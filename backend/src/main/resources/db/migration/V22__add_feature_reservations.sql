-- V22: Add feature reservations table for safe transactional quota deduction
CREATE TABLE IF NOT EXISTS feature_reservations (
    id VARCHAR(36) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255),
    feature_key VARCHAR(50) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    source VARCHAR(30) NOT NULL,
    usage_id BIGINT,
    subscription_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    custom_entitlement_id BIGINT,
    custom_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(30) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feature_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feature_res_user ON feature_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_res_status_exp ON feature_reservations(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_feature_res_created ON feature_reservations(created_at);
