-- V23: Add performance and replay protection indexes on razorpay_payment_id

CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id
    ON payment_transactions (razorpay_payment_id);

CREATE INDEX IF NOT EXISTS idx_feature_entitlements_payment_id
    ON feature_entitlements (razorpay_payment_id);
