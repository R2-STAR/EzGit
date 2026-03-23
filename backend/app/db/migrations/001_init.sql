CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
    id           SERIAL PRIMARY KEY,
    repo_url     TEXT NOT NULL,
    pr_number    INT  NOT NULL,
    title        TEXT,
    summary      JSONB,
    risk_score   INT DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (repo_url, pr_number)
);

CREATE TABLE IF NOT EXISTS scan_results (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_url          TEXT NOT NULL,
    status            TEXT DEFAULT 'pending',
    semgrep_findings  JSONB,
    snyk_findings     JSONB,
    ai_report         TEXT,
    error_message     TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    completed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scan_repo
    ON scan_results (repo_url);

CREATE TABLE IF NOT EXISTS indexed_repos (
    id           SERIAL PRIMARY KEY,
    repo_url     TEXT UNIQUE NOT NULL,
    status       TEXT DEFAULT 'pending',
    file_count   INT DEFAULT 0,
    chunk_count  INT DEFAULT 0,
    indexed_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
