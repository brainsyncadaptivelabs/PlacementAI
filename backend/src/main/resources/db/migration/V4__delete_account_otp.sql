-- Create delete_account_verification table
CREATE TABLE delete_account_verification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    attempts INT DEFAULT 0,
    resend_count INT DEFAULT 0,
    last_resend_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_delete_account_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
