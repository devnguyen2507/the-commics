# 035 - Implementation Report: Crawler & Data V2.5

## I. Overview
Bản báo cáo này mô tả chi tiết quá trình thực thi và hoàn thiện hệ thống Crawler Engine phiên bản V2.5. Trọng tâm của phiên bản này là **Cô lập trạng thái Worker**, **Quản lý Assets linh hoạt** và **Cấu trúc lưu trữ CDN-Ready**.

## II. Key Components

### 1. Database Management Layer (Diesel & SQLAlchemy)
- **Migrations**: Đã triển khai hệ thống migration bằng `diesel-cli` đặt tại `src/backend/crawler/migrations`. 
- **Automatic Runner**: Tích hợp Migration Runner tự động tại `db/database.py`, tự động thực thi `up.sql` khi container khởi chạy.
- **Category Normalization (V2.5)**: 
    - Chuyển `categories` từ JSONB sang bảng quan hệ Many-to-Many.
    - Bảng `categories`: Lưu ID (slug) và tên thể loại chuẩn.
    - Bảng `comic_categories`: Lưu mapping giữa truyện và thể loại.
- **Schema Separation**: 
    - **Public Content**: `comics`, `chapters`, `categories`.
    - **Asset Management**: `assets` (Track URL gốc, Path vật lý, Trạng thái tải).
    - **Worker State**: `worker_comics`, `worker_chapters` (Dùng để kiểm tra update, sync progress mà không làm bẩn bảng chính).
- **ID Strategy**: Chuyển đổi hoàn toàn sang **Slug-based IDs** (`truyen-a`, `truyen-a-chap-1`, `harem`).

### 2. Physical Storage Refactor
- **Location**: Toàn bộ dữ liệu ảnh tải về được lưu tại `ops/docker/storage_data`.
- **CDN Preparation**: Cấu trúc thư mục `{slug}/chapters/{num}/{idx}.jpg` giúp CDN (như Cloudflare hoặc imgflux) dễ dàng map volume để phân phối.
- **Git Hygiene**: `.gitignore` được thiết lập để không commit dữ liệu ảnh nhưng vẫn giữ lại cấu trúc thư mục.

### 3. Workflow & Activity Logic (Temporal)
- **Extraction-Persistence Decoupling**: 
    - Workflow bóc tách HTML chỉ ghi nhận URL vào bảng `assets`.
    - Workflow tải ảnh (`download_images`) xử lý IO riêng biệt.
- **Incremental Sync**: Hoạt động `check_comic_update` so sánh metadata mới với `worker_chapters` để chỉ crawl những chapter chưa tồn tại.
- **Option `only-img`**: Cho phép chạy lại chỉ để re-sync ảnh mà không cần parse lại HTML trang web.

## III. Verification Results
- **End-to-End Test**: Đã verify việc crawl full truyện (ví dụ: *Đã Ký, Đã Nhầm Lẫn, Đã Đóng Dấu*).
- **Relational Integrity**: 
    - Bảng `chapters.images` chứa mảng JSON các Asset ID.
    - Bảng `assets` chứa mapping chính xác tới `storage_path` vật lý.
- **Update Logic**: Chạy lại crawler lần 2 cho cùng 1 truyện, hệ thống báo "0 chapters to crawl" (Correct behavior).

## IV. QA Status
- **Current State**: Ready for Quality Assurance.
- **Artifacts**: `walkthrough.md`, `Spec-Crawler-V2.md`.
