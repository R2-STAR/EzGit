-- Backfill pr_summaries with columns added after the original schema.
-- Idempotent: safe to run on both fresh and existing databases.
ALTER TABLE pr_summaries
    ADD COLUMN IF NOT EXISTS author        TEXT,
    ADD COLUMN IF NOT EXISTS changed_files JSONB;
