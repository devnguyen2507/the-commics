CREATE TABLE IF NOT EXISTS worker_comics (
    id VARCHAR(255) PRIMARY KEY,
    source_url VARCHAR(1024) NOT NULL,
    status VARCHAR(50) DEFAULT 'idle', -- idle, syncing, completed, failed
    chapter_count INTEGER DEFAULT 0,
    latest_chapter_number FLOAT,
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS worker_chapters (
    id VARCHAR(255) PRIMARY KEY,
    comic_id VARCHAR(255) NOT NULL REFERENCES worker_comics(id) ON DELETE CASCADE,
    chapter_number FLOAT NOT NULL,
    source_url VARCHAR(1024) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, extracted, downloaded, failed
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
