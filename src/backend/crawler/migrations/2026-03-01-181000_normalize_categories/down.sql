-- Restore categories column to comics
ALTER TABLE comics ADD COLUMN IF NOT EXISTS categories JSONB;

-- Drop join table and categories table
DROP TABLE IF EXISTS comic_categories;
DROP TABLE IF EXISTS categories;
