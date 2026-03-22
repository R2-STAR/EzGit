CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE IF NOT EXISTS code_embeddings (
    id          SERIAL PRIMARY KEY,
    repo_url    TEXT NOT NULL,
    file_path   TEXT NOT NULL,
    chunk_text  TEXT NOT NULL,
    embedding   vector(768),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_repo
    ON code_embeddings (repo_url);

CREATE INDEX IF NOT EXISTS idx_embeddings_vector
    ON code_embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE TABLE IF NOT EXISTS pr_summaries (
    id          SERIAL PRIMARY KEY,
    repo_url    TEXT NOT NULL,
    pr_number   INT  NOT NULL,
    title       TEXT,
    summary     JSONB,
    risk_score  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (repo_url, pr_number)
);
