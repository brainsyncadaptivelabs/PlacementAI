-- Alter users table to add verification columns
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verified_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN account_status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN phone VARCHAR(50) NULL;

-- Create signup_verification table
CREATE TABLE signup_verification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50),
    college VARCHAR(255),
    branch VARCHAR(255),
    graduation_year INT,
    semester INT,
    skills TEXT,
    preferred_role VARCHAR(255),
    company_name VARCHAR(255),
    otp_hash VARCHAR(255) NOT NULL,
    attempts INT DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    resend_count INT DEFAULT 0,
    last_resend_at TIMESTAMP NULL,
    INDEX idx_signup_email (email)
);
