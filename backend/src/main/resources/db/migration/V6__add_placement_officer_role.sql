-- Flyway migration to alter the users table role column
-- This adds 'PLACEMENT_OFFICER' to the enum mapping to match Java Role enum definition.
ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'RECRUITER', 'STUDENT', 'PLACEMENT_OFFICER') DEFAULT NULL;
