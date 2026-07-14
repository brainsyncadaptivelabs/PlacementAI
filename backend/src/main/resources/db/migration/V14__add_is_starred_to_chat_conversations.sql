-- Flyway Migration V14: Add is_starred column to chat_conversations
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE NOT NULL;
