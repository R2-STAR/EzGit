-- Backfill indexed_repos with an error_message column so the UI can explain
-- why an index failed instead of showing a generic message.
-- Idempotent: safe to run on both fresh and existing databases.
ALTER TABLE indexed_repos
    ADD COLUMN IF NOT EXISTS error_message TEXT;
