-- Revert migration: Drop seo_contents table
BEGIN;
DROP TABLE IF EXISTS seo_contents;
COMMIT;
