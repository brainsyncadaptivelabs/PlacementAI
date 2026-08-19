-- Supabase Migration: Create pgvector extension, company_questions_embeddings table, and backfill metadata

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create company_questions_embeddings table if not exists (matching LangChain4j PgVectorEmbeddingStore schema)
CREATE TABLE IF NOT EXISTS company_questions_embeddings (
    embedding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    embedding vector(1536),
    text TEXT,
    metadata JSONB
);

-- 3. Create index on JSONB metadata for company_normalized lookup performance
CREATE INDEX IF NOT EXISTS idx_company_questions_embeddings_company_normalized 
ON company_questions_embeddings ((metadata->>'company_normalized'));

-- 4. One-time Data Backfill for existing rows
UPDATE company_questions_embeddings
SET metadata = jsonb_set(
    metadata,
    '{company_normalized}',
    to_jsonb(lower(trim(metadata->>'company')))
)
WHERE metadata->>'company' IS NOT NULL 
  AND metadata->>'company_normalized' IS NULL;
