-- Add delete account password locking fields to users table
ALTER TABLE users ADD COLUMN delete_lock_expires_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN delete_failed_attempts INT DEFAULT 0;
