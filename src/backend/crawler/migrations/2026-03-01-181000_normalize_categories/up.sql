-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR PRIMARY KEY, -- Slug
    name VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comic_categories join table
CREATE TABLE IF NOT EXISTS comic_categories (
    comic_id VARCHAR REFERENCES comics(id) ON DELETE CASCADE,
    category_id VARCHAR REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (comic_id, category_id)
);

-- Remove categories column from comics
ALTER TABLE comics DROP COLUMN IF EXISTS categories;
