-- Standardize code_embeddings on 768-dim vectors.
--
-- gemini-embedding-001 returns 3072 dims by default, but pgvector indexes
-- (ivfflat/hnsw) support at most 2000 dims, so we truncate the model output to
-- 768 via outputDimensionality in gemini.py. This migration repairs any
-- database where the column drifted to vector(3072).
--
-- Existing rows cannot be cast safely, so drop stale rows first. On a fresh
-- database the column is already vector(768) and this is a no-op.
TRUNCATE code_embeddings;
ALTER TABLE code_embeddings
    ALTER COLUMN embedding TYPE vector(768);

-- Recreate the similarity index (ALTER TYPE may drop it).
CREATE INDEX IF NOT EXISTS idx_embeddings_vector
    ON code_embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
