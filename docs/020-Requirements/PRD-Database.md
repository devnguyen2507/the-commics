---
id: PRD-021
type: prd
status: active
project: commics
owner: DevNguyen
tags: [database, postgres, redis, schema]
created: 2026-03-01
---

# PRD: Hệ thống Database (Persistence Layer)

## 1. Tóm tắt điều hành
Lớp Persistence Layer chịu trách nhiệm lưu trữ toàn bộ dữ liệu nghiệp vụ của dự án Commics, bao gồm thông tin truyện, chương, và quan trọng nhất là trạng thái của các tiến trình crawling. Hệ thống kết hợp PostgreSQL cho dữ liệu quan hệ và Redis cho lớp đệm (Cache).

## 2. Mục tiêu
- **Hiệu năng**: Tối ưu truy vấn danh sách truyện và nội dung chương với lưu lượng lớn.
- **Khả năng kiểm soát**: Cung cấp các trường thông tin theo dõi tiến trình (Worker Tracking) để dễ dàng quản lý crawling.
- **Tính nhất quán**: Ràng buộc dữ liệu chặt chẽ, đặc biệt là định dạng chương (String) và logic sắp xếp.

## 3. Thực thể chính (Major Entities)

### 3.1. Comic (Truyện)
- **Cấu trúc**: `id`, `slug`, `title`, `description`, `author`, `status`, `source_url`, `source_name`.
- **Media**: Logo_path, Banner_path, Icon_path, Thumbnail_path.
- **Categories**: Quan hệ many-to-many với bảng `Categories`.

### 3.2. Chapter (Chương)
- **Cấu trúc**: `id`, `comic-id`, `chapter_number` (STRING), `order_index` (INTEGER/FLOAT).
- **Content**: `storage_path` (Dẫn tới folder chứa ảnh raw trên disk).

### 3.3. Worker Tracking (Quản lý tiến trình)
Cung cấp các cột có prefix `worker-` trong các bảng liên quan:
- `worker_status`: Trạng thái (pending, crawling, success, error).
- `worker_last_run`: Thời điểm cuối cùng thực hiện workflow.
- `worker_error_log`: Chi tiết lỗi để phục vụ retry.
- `worker_chapter_count`: Số lượng chương đã thu thập so với nguồn.

## 4. Chiến lược Cache (Redis)
- Cache metadata của truyện (chi tiết trang truyện).
- Cache danh sách JSON của chapter content để giảm I/O cho disk/DB khi phục vụ reader.

## 5. Yêu cầu phi chức năng
- **Schema Extensibility**: Cho phép thêm trường metadata tùy biến theo từng nguồn crawl.
- **Data Safety**: Đảm bảo phân biệt rõ ràng dữ liệu phục vụ GraphQL và dữ liệu quản lý worker.

---
**PIC Skill**: `postgresql`
**Owner**: DevNguyen
