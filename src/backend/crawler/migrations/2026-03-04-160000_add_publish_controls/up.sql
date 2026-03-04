ALTER TABLE comics ADD COLUMN is_publish BOOLEAN DEFAULT false;
ALTER TABLE comics ADD COLUMN published_at TIMESTAMP;

ALTER TABLE chapters ADD COLUMN is_publish BOOLEAN DEFAULT false;
ALTER TABLE chapters ADD COLUMN published_at TIMESTAMP;

-- Migrate existing data
UPDATE comics SET is_publish = true, published_at = NOW();
UPDATE chapters SET is_publish = true, published_at = NOW();
