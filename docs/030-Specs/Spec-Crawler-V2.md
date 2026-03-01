# Architectural Spec & Action Plan: Crawler V2

## I. Phân tích Các Vấn Đề Tồn Đọng (Pain Points)
Dựa theo phản hồi, version đầu tiên của Crawler đang để lại những technical debt sau:
1. **Khởi tạo Database nguyên thủy**: Đang dùng `Base.metadata.create_all`, thiếu track revisions (`migrations`). Sẽ gây vỡ Database nếu update Schema sau này.
2. **Data Normalization Kém**: Bảng `comics` và `chapters` hiện đang chứa mix cả "Dữ liệu truyện (trưng bày UI)" lẫn "Trạng thái của System/Worker (worker_status)". Việc này sai nguyên tắc và khó trace lỗi.
3. **Thiếu Logging bài bản**: Quá trình chạy crawl dưới nền của Temporal diễn ra hộp đen, thiếu Trace ID hay Logs theo dỏi từng tiến trình bóc tách.
4. **Infra Risk**: Temporal và App Core đang chung 1 PostgreSQL database. Reset Temporal schema có thể rủi ro làm drop nhầm bảng data.
5. **Coupled Logic (Mã kẹp)**: Các logic phân tích HTML (Regex, find tags) của `HentaiVN` hiện đang cứng chết trong các hàm của file `activities.py`. Muốn crawl site thứ 2 như nhentai, nettruyen... sẽ phải viết Activity mới làm phình to code trùng lặp (ví dụ các tác vụ tải hình, tải HTML đều gióng nhau).

---

## II. Crawler V2 Specification

### 1. Extensible Parser Architecture (Strategy Pattern)
Quy hoạch tách biệt "Tiến trình điều hướng (Flow)" khỏi "Logic bóc tách (Parsing)".
**Cấu trúc thư mục mới:**
```
src/backend/
├── crawler/
│   ├── migrations/             # Chứa db migrations của Diesel (đóng gói trong Docker context)
│   │   └── YYYY-MM-DD-HHMMSS_init/
│   ├── core/                   
│   │   ├── logger.py           # Centralized structured logging setup
│   │   └── database.py         # SQLAlchemy & config env
│   ├── models/
│   │   ├── base.py
│   │   ├── comic.py            # Dữ liệu comic, chapters tĩnh (sử dụng Slug làm ID)
│   │   └── task.py             # Bảng worker_tasks
│   ├── parsers/
│   ├── base_parser.py      # Abstract Interface
│   ├── hentaivn_parser.py  # Regex/bs4 riêng của hentaivn
│   └── factory.py          # Route domain url về đúng parser
├── activities/
│   ├── generic_activities.py # Tải HTML, Download File
│   └── db_activities.py      # Cập nhật db thông qua Task
├── workflows/
...
```

### 2. Database Schema V2 (Normalized & Asset-centric)
Tách bạch dữ liệu thành 3 nhóm:
- **Nhóm Content (Frontend)**: `comics`, `chapters`.
  - `comics`: `id` (Slug), `source_url`, `title`, `author`, `description`, `categories`, `thumbnail_path`.
  - `chapters`: `id` (`comic-slug-NN`), `comic_id`, `chapter_number`, `order_index`, `images` (Mảng JSON chứa list reference tới `assets.id`).
- **Nhóm Assets (Media)**: Tác vụ tải ảnh thường lỗi/chậm, cần track riêng.
  - `assets`:
    - `id` (UUID)
    - `comic_id`, `chapter_id` (Nullable)
    - `type` (`manga-page`, `logo`, `banner`, `thumbnail`)
    - `source_url` (URL gốc trên CDN gốc)
    - `storage_path` (Đường dẫn tương đối trong `storage_data`)
    - `order_index` (Thứ tự hiển thị)
    - `status` (`pending`, `downloaded`, `failed`)
- **Nhóm Worker System Management**:
  - `worker_comics`: `id` (Slug), `source_url`, `status`, `chapter_count`, `latest_chapter_number`, `last_sync_at`, `last_error`.
  - `worker_chapters`: `id` (Slug), `comic_id`, `chapter_number`, `source_url`, `status`, `last_sync_at`.
- **Nhóm Task**: `worker_tasks` để track tiến trình workflow.

### 3. Storage Hierarchy Strategy
Quy định rõ folder mount `/storage_data` trên host (đã di chuyển vào `ops/docker/storage_data` để đóng gói CDN):
- `ops/docker/storage_data/{comic-slug}/logo/`
- `ops/docker/storage_data/{comic-slug}/banners/`
- `ops/docker/storage_data/{comic-slug}/chapters/{chapter-num}/{index}.jpg`

### 4. Decoupled Workflow: Extract vs. Download
Tách logic crawl thành 2 giai đoạn:
1. **Extraction (Stage 1)**: Bóc tách URL ảnh từ page -> Lưu vào bảng `assets` với trạng thái `pending`.
2. **Persistence (Stage 2)**: Workflow tải ảnh sẽ đọc từ bảng `assets` -> Tải về disk -> Cập nhật trạng thái `downloaded`.
*Lợi ích*: Nếu Stage 2 lỗi (CDN die, mạng lag), ta vẫn có URL gốc trong DB để retry sau hoặc proxy trực tiếp. Giao diện có thể chuyển option `only-img` để chỉ re-sync ảnh.

### 5. Database Migration with Diesel CLI (Encapsulated)
Ta sẽ dùng `diesel-cli` để chuẩn hoá file migrations bằng raw SQL:
- Tạo thư mục `src/backend/crawler/migrations`. Việc nằm bên trong folder crawler giúp file Dockerfile dễ dàng COPY và quản lý trên môi trường khép kín (Production).
- Mỗi bản cập nhật DB sinh cặp file `up.sql` và `down.sql` theo chuẩn timestamp.
- Sau này backend GraphQL sẽ sao chép cấu trúc thư mục này sang để build `schema.rs`.
- Crawler Python chỉ dùng SQLAlchemy models để Query/Upsert.

### 6. Docker Infrastructure Isolation
Thay đổi `docker-compose.yml`:
- Mở riêng 1 instance `temporal-db` dựa trên PostgreSQL image (Port host mapper 5434). Setup Temporal trỏ hoàn toàn vào cục DB này.
- `db` (Port 5433) sẽ chỉ do Backend (Crawler, GraphQL sau này) sở hữu và quản lý bằng thư mục `migrations`.

### 7. Logging
Bổ sung Python `logging` module kèm `structlog` để log ra console từng hành động:
- `[INFO] Parsing Comic URL: ...`
- `[ERROR] Cannot find chapter tags for HentaiVN. URL: ...`
