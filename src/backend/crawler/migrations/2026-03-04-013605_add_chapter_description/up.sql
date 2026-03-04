-- Phase 3 SEO: thêm description cho chapters (dùng cho meta description + SEO box)
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS description TEXT;
