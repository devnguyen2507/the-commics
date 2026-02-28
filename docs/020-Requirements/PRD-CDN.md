---
id: PRD-023
type: prd
status: active
project: commics
owner: DevNguyen
tags: [cdn, imgflux, edge, image-optimization]
created: 2026-03-01
---

# PRD: Hệ thống CDN & Optimization (imgflux)

## 1. Tóm tắt điều hành
Hệ thống CDN chịu trách nhiệm xử lý, tối ưu hóa và phân phối hình ảnh truyện từ disk đến người dùng cuối. Sử dụng `imgflux` (Rust) để cung cấp khả năng resize/convert ảnh theo thời gian thực tại edge.

## 2. Mục tiêu
- **Tốc độ load**: Giảm kích thước ảnh nhưng vẫn giữ chất lượng cho Reader.
- **Tối ưu băng thông**: Cache ảnh đã xử lý tại layer CDN để giảm tải cho storage server.
- **Linh hoạt**: Hỗ trợ nhiều kích thước (Thumbnail PC, Mobile, HD Banner).

## 3. Chức năng cốt lõi
- **Dynamic Resizing**: Tự động sinh thumbnails từ ảnh raw theo tham số URL.
- **Format Conversion**: Chuyển đổi sang WebP/Avif để tối ưu hóa trình duyệt.
- **Edge Caching**: Lưu trữ các phiên bản ảnh đã được xử lý.

## 4. Yêu cầu kỹ thuật
- **Tech Stack**: Rust (`imgflux` source code).
- **Input Storage**: Đọc từ thư mục `storage/commics/...` do Crawler tạo ra.

---
**PIC Skill**: `cloudflare-workers-expert`
**Owner**: DevNguyen
