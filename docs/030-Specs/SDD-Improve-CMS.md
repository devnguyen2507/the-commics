# SDD: Cải thiện CMS cho Quản lý SEO

Tài liệu này đề xuất các cải tiến cho hệ thống CMS để quản lý SEO hiệu quả cho toàn bộ website.

## 1. Mục tiêu
- Cho phép người quản trị (Admin) tùy chỉnh Meta Tags (Title, Description, Keywords) cho TOÀN BỘ các trang bao gồm Truyện, Chương, Danh mục và các trang tĩnh.
- Tách biệt dữ liệu SEO khỏi dữ liệu nội dung (Truyện/Chương) để có thể tùy chỉnh độc lập.
- Quản lý trạng thái hiển thị (`is_publish`) và ngày phát hành (`published_at`) cho mục đích SEO/Sitemap.

## 2. Thiết kế Cơ sở dữ liệu
Thêm bảng `seo_contents` (đổi tên từ `seo_configs`):
- `id` (UUID, PK)
- `path` (String, unique): Đường dẫn URL (Ví dụ: `/`, `/truyen/slug`, `/truyen/slug/chap-1`).
- `title` (String)
- `description` (Text)
- `keywords` (String)
- `is_published` (Boolean, default: false): Trạng thái cho phép index/sitemap.
- `published_at` (Timestamp, default: NULL): Dùng làm `lastmod`.
- `entity_type` (Enum): `comic`, `chapter`, `category`, `page`.
- `entity_id` (String): ID của thực thể tương ứng (nếu có).
- `created_at`, `updated_at`.

> [!IMPORTANT]
> Toàn bộ `path` trong bảng `seo_contents` phải được slugified đồng bộ giữa UI và Crawler để tránh lỗi 404 và trùng lặp nội dung.

## 3. Chiến lược Migration
Khi khởi tạo bảng `seo_contents`, thực hiện chuyển đổi dữ liệu từ các bảng cũ:
1. **Comics:** 
   - Path: `/truyen/{slug}`
   - Title: `{title}`
   - Description: `{description}`
   - PublishedAt: `2026-03-07T07:56:40.915Z`
2. **Chapters:**
   - Path: `/truyen/{comic_slug}/chap-{chapter_number}/`
   - Chapter Number được slugified (Ví dụ: "Ch. 01" -> "ch-01").
   - PublishedAt: `2026-03-07T07:56:40.915Z` (hoặc ngày crawl thực tế).
3. **Categories:**
   - Path: `/the-loai/{slug}`
4. **Static Pages:** Insert các trang mặc định: `/`, `/truyen-hot`, `/truyen-moi`, `/chinh-sach`, v.v.

## 4. Tối ưu hóa CMS & API
- **GraphQL:** Thêm các Query/Mutation để CRUD bảng `seo_contents`. 
- **CMS UI:** Cung cấp giao diện chỉnh sửa toàn bộ các trường trên cho mỗi đường dẫn.
- **Independence:** Thay đổi dữ liệu trong `seo_contents` sẽ không tác động đến dữ liệu gốc trong bảng `comics` hay `chapters`.
