-- Migration: Create seo_contents table and migrate exist data
-- Table for concentrated SEO management
BEGIN;

CREATE TABLE IF NOT EXISTS seo_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    keywords VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    entity_type VARCHAR(50), -- 'comic', 'chapter', 'category', 'page'
    entity_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migration logic (Explicitly set published data)
-- 1. Migrate Comics
INSERT INTO seo_contents (path, title, description, entity_type, entity_id, is_published, published_at)
SELECT 
    '/truyen/' || slug || '/' as path,
    title,
    description,
    'comic' as entity_type,
    id as entity_id,
    TRUE,
    '2026-03-07 07:56:40.915+00'
FROM comics
ON CONFLICT (path) DO NOTHING;

-- 2. Migrate Chapters
INSERT INTO seo_contents (path, title, entity_type, entity_id, is_published, published_at)
SELECT 
    '/truyen/' || c.slug || '/chap-' || ch.chapter_number || '/' as path,
    c.title || ' - Chương ' || ch.chapter_number as title,
    'chapter' as entity_type,
    ch.id as entity_id,
    TRUE,
    '2026-03-07 07:56:40.915+00'
FROM chapters ch
JOIN comics c ON ch.comic_id = c.id
ON CONFLICT (path) DO NOTHING;

-- 3. Migrate Categories
INSERT INTO seo_contents (path, title, entity_type, entity_id, is_published, published_at)
SELECT 
    '/the-loai/' || id || '/' as path,
    name as title,
    'category' as entity_type,
    id as entity_id,
    TRUE,
    '2026-03-07 07:56:40.915+00'
FROM categories
ON CONFLICT (path) DO NOTHING;

-- 4. Initial Static Pages
INSERT INTO seo_contents (path, title, description, entity_type, is_published, published_at)
VALUES 
    ('/', 'Trang chủ - Đọc truyện online', 'Website đọc truyện tranh miễn phí', 'page', TRUE, '2026-03-07 07:56:40.915+00'),
    ('/truyen-hot/', 'Truyện Hot - BXH Truyện Tranh', 'Danh sách truyện được xem nhiều nhất', 'page', TRUE, '2026-03-07 07:56:40.915+00'),
    ('/truyen-moi/', 'Truyện Mới Cập Nhật', 'Đọc truyện tranh mới nhất hàng daily', 'page', TRUE, '2026-03-07 07:56:40.915+00'),
    ('/the-loai/', 'Danh sách thể loại', 'Tổng hợp tất cả thể loại truyện', 'page', TRUE, '2026-03-07 07:56:40.915+00'),
    ('/chinh-sach/', 'Chính sách bảo mật', '', 'page', TRUE, '2026-03-07 07:56:40.915+00'),
    ('/dieu-khoan/', 'Điều khoản sử dụng', '', 'page', TRUE, '2026-03-07 07:56:40.915+00'),
    ('/cau-hoi-thuong-gap/', 'FAQ - Câu hỏi thường gặp', '', 'page', TRUE, '2026-03-07 07:56:40.915+00'),
    ('/lien-he/', 'Liên hệ', '', 'page', TRUE, '2026-03-07 07:56:40.915+00'),
    ('/tim-kiem/', 'Tìm kiếm truyện', '', 'page', TRUE, '2026-03-07 07:56:40.915+00')
ON CONFLICT (path) DO NOTHING;

COMMIT;
