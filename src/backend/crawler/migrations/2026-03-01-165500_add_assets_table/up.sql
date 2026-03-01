CREATE TABLE assets (
    id VARCHAR PRIMARY KEY,
    comic_id VARCHAR NOT NULL REFERENCES comics(id),
    chapter_id VARCHAR REFERENCES chapters(id),
    asset_type VARCHAR NOT NULL, -- manga-page, logo, banner, thumbnail
    source_url VARCHAR NOT NULL,
    storage_path VARCHAR,
    order_index FLOAT NOT NULL DEFAULT 0,
    status VARCHAR NOT NULL DEFAULT 'pending', -- pending, downloaded, failed
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_comic_id ON assets(comic_id);
CREATE INDEX idx_assets_chapter_id ON assets(chapter_id);
