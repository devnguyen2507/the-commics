-- Phase 2 SEO: thêm description cho categories (dùng để SEO box content)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
