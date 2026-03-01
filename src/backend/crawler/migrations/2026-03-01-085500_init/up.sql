CREATE TABLE comics (
    id VARCHAR PRIMARY KEY,
    source_url VARCHAR UNIQUE NOT NULL,
    slug VARCHAR,
    title VARCHAR NOT NULL,
    author VARCHAR,
    description TEXT,
    status VARCHAR,
    categories JSONB,
    logo_path VARCHAR,
    banner_path VARCHAR,
    thumbnail_path VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chapters (
    id VARCHAR PRIMARY KEY,
    comic_id VARCHAR NOT NULL,
    chapter_number VARCHAR NOT NULL,
    order_index DOUBLE PRECISION NOT NULL,
    source_url VARCHAR UNIQUE NOT NULL,
    images JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_comic_chapter UNIQUE (comic_id, chapter_number)
);

CREATE TABLE worker_tasks (
    id VARCHAR PRIMARY KEY,
    workflow_id VARCHAR NOT NULL,
    target_type VARCHAR NOT NULL,
    target_url VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'pending',
    error_logs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
