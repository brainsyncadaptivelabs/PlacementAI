-- Flyway Migration V14: Add is_starred column to chat_conversations safely

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
        ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
END $$;
