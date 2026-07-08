-- Flyway migration to alter the users table role column
-- This ensures PostgreSQL compatibility by altering the column type to VARCHAR.
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);
