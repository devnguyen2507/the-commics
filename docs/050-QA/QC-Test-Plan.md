# QC Test Plan & Test Cases: Crawler & Database V2.5

Tài liệu này xác định các kịch bản kiểm thử (Test Cases) nhằm xác thực độ ổn định của hệ thống Crawler và tính toàn vẹn của dữ liệu sau khi chuẩn hóa.

## I. Môi trường Kiểm thử (Environment)
- **Engine**: Dockerized Crawler (Python 3.11 + Temporal).
- **Database**: PostgreSQL 15 (Relational Mode).
- **Target URL**: `hentaivn.tel` (Thực tế).

## II. Danh sách Test Cases

### 1. Phân hệ Database & Migration (DB-TC)
| ID | Tên kịch bản | Mô tả các bước | Kết quả mong đợi |
| --- | --- | --- | --- |
| DB-TC-01 | **Atomic Migration** | Khởi động container crawler lần đầu. | Tất cả bảng (`comics`, `chapters`, `assets`, `categories`, `comic_categories`, `worker_comics`, `worker_chapters`) được tạo thành công. |
| DB-TC-02 | **Relation Integrity** | Chạy Crawler cho truyện "A" có 3 thể loại. | Bảng `categories` có 3 dòng mới. Bảng `comic_categories` có 3 dòng liên kết id của "A". |
| DB-TC-03 | **Cascade Delete** | Xóa bản ghi truyện đầu tiên ở bảng `comics`. | Các liên kết ở `comic_categories` và `chapters` phải tự động biến mất. |

### 2. Phân hệ Data Integrity & Content Accuracy (DI-TC)
| ID | Tên kịch bản | Mô tả các bước | Kết quả mong đợi |
| --- | --- | --- | --- |
| DI-TC-01 | **Metadata Fidelity** | So sánh thông tin truyện crawl được (`title`, `author`, `description`) với trang gốc. | Dữ liệu khớp 100%, không bị lỗi font hoặc mất ký tự. |
| DI-TC-02 | **Asset Object Detail** | Kiểm tra mảng `images` trong bảng `chapters`. | Lưu đúng định dạng JSONB: `id`, `w`, `h`, `file_path`. Độ rộng/cao > 0. |
| DI-TC-03 | **Author Parsing** | Crawl truyện có ghi rõ tên tác giả. | Trường `author` phải có dữ liệu, không được để trống (null) nếu trang web có thông tin. |
| DI-TC-04 | **Relational Categories** | Kiểm tra bảng `categories` sau khi sync. | Không có category trùng lặp. Slug chuẩn SEO (như `action-romance`). |

### 3. Phân hệ Crawler Workflow (CR-TC)
| ID | Tên kịch bản | Mô tả các bước | Kết quả mong đợi |
| --- | --- | --- | --- |
| CR-TC-01 | **Full Sync Validation** | Kích hoạt crawl 1 bộ truyện hoàn chỉnh. | Chapter count khớp với thực tế. Toàn bộ ảnh được tải về đúng folder format. |
| CR-TC-02 | **Only-Image Recovery** | Set flag `only_img=True` và chạy lại sync cho 1 chapter đã tồn tại metadata. | Crawler bỏ qua bước parse HTML, đi thẳng vào tải ảnh từ bảng `assets`. |
| CR-TC-03 | **Incremental Update & Refresh** | Chạy lại sync cho truyện đã hoàn thành. | Hệ thống báo 0 chapter mới, nhưng vẫn update `last_sync_at` và `latest_chapter_number` trong `worker_comics`. |
| CR-TC-04 | **Stage Separation** | Ngắt mạng ngay sau khi Stage 1 (Extract) xong. | Kiểm tra bảng `assets`: Đã có URL gốc nhưng `status` là `pending`. Stage 2 sẽ chạy lại được sau khi có mạng. |

## III. Execution Command (Dành cho Dev/QA)
```bash
# 1. Reset & Start Infra
docker-compose -f ops/docker/docker-compose.yml --profile infra --profile services up -d --build crawler

# 2. Trigger TC-01 (Full Sync & Category mapping)
docker exec -it commics-crawler python tmp/crawl_comic.py "URL_TRUYEN_A"

# 3. Verify SQL
docker exec -it docker-db-1 psql -U commics -d commics -c "SELECT * FROM categories;"
```
