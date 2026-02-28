---
id: PRD-022
type: prd
status: active
project: commics
owner: DevNguyen
tags: [graphql, rust, api]
created: 2026-03-01
---

# PRD: GraphQL API Layer

## 1. Tóm tắt điều hành
GraphQL Layer là cổng giao tiếp duy nhất giữa Frontend và Backend, cung cấp khả năng truy vấn dữ liệu truyện linh hoạt và hiệu năng cao. Hệ thống được xây dựng bằng **Rust**, kế thừa và tinh gọn từ source mẫu hiện có.

## 2. Mục tiêu
- **Tốc độ**: Tận dụng hiệu năng của Rust để xử lý hàng ngàn request đồng thời.
- **Linh hoạt**: Cho phép Frontend lấy chính xác dữ liệu cần thiết (truyện hot, chapter list, image links).
- **Tính nhất quán**: Đảm bảo trả về danh sách chương theo đúng thứ tự (`order_index`) đã crawl.

## 3. Chức năng chính (Query/Types)

### 3.1. Comic Queries
- Lọc theo Category/Genre.
- Lấy danh sách truyện mới cập nhật, truyện hot.
- Tìm kiếm theo tên hoặc tác giả.

### 3.2. Chapter Serving
- Cung cấp danh sách chapter của một `comic-id`. **Bắt buộc** trả về theo đúng thứ tự logic.
- Cung cấp danh bạ ảnh (`img_list`) cho một `chapter_id`.

## 4. Yêu cầu kỹ thuật
- **Tech Stack**: Rust (Dùng source mẫu, loại bỏ modules thừa).
- **Data Integration**: Đọc trực tiếp từ Postgres và lớp Cache Redis.
- **Ordering Strategy**: Logic sắp xếp dựa trên `order_index` được Crawler xử lý sẵn.

---
**PIC Skill**: `graphql-architect`
**Owner**: DevNguyen
