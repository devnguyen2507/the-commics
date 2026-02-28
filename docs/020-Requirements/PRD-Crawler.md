---
id: PRD-020
type: prd
status: active
project: commics
owner: DevNguyen
tags: [crawler, temporal, hentaivn, python]
created: 2026-03-01
---

# PRD: Hệ thống Crawler (Comic Engine)

## 1. Tóm tắt điều hành
Hệ thống Crawler chịu trách nhiệm thu thập tự động và chính xác dữ liệu truyện (Comics) từ các nguồn mục tiêu, bắt đầu với `hentaivn.ch`. Hệ thống sử dụng **Temporal** để điều phối quy trình công việc, đảm bảo việc crawling ổn định, có khả năng thử lại (retry) và thu thập tài nguyên (hình ảnh) hiệu quả.

## 2. Mục tiêu
- **Tính tự động**: Thu thập dữ liệu mới và cập nhật dữ liệu cũ mà không cần can thiệp thủ công.
- **Tính chính xác**: Đảm bảo thứ tự chương (ordering) và định dạng dữ liệu (String chapter) đồng nhất.
- **Khả năng mở rộng**: Kiến trúc cho phép dễ dàng thêm các nguồn crawl mới (multi-source).
- **Tính bền bỉ**: Sử dụng Temporal để quản lý lỗi, timeout và duy trì trạng thái crawling.

## 3. Workflow chi tiết (Temporal)

### 3.1. Workflow 1: Comic Listing & Metadata
- **Input**: `comic-id`.
- **Chức năng**:
    - Crawl/Update thông tin chung: Tiêu đề, Tác giả, Description, Trạng thái, Danh sách Categories.
    - Crawl/Update Media assets: Logo, Banner, Icon, Thumbnail.
    - Cập nhật số lượng chapter hiện có.
- **Mục tiêu**: Cung cấp dữ liệu cho trang danh sách và trang chi tiết truyện.

### 3.2. Workflow 2: Chapter Details & Assets
- **Input**: `comic-id`, `chapter_id` (tùy chọn).
- **Chức năng**:
    - **Crawl Assets**: Lấy danh sách link hình ảnh (`<img>`) theo đúng thứ tự.
    - **Download**: Tải ảnh raw về disk theo cấu trúc storage quy định.
    - **Batch Processing**: Nếu không có `chapter_id`, tự động quét và crawl toàn bộ chapters chưa có dữ liệu theo thứ tự (detect up-to-date).
- **Logic Order**: Sử dụng `chapterNumber` (String) và `order` index để đảm bảo GraphQL trả về dữ liệu đúng trình tự.

## 4. Yêu cầu kỹ thuật & Logic
- **Tech Stack**: Python, `ai` scraping lib, `aiohttp`, Temporal.
- **Data Type**: Bắt buộc dùng kiểu **STRING** cho chapter number (No float: "1", "2.1", "100").
- **Target Nguyên bản**: Ảnh được lưu trực tiếp dạng raw, không chỉnh sửa.
- **Target Source**: `https://hentaivn.ch/` (Ưu tiên hàng đầu).

## 5. Cấu trúc lưu trữ (Storage)
- **Path**: `storage/commics/{comic-id}/chapter/{chapter-id}/<thu-tu>.<format ảnh>`

---
**PIC Skill**: `playwright-skill`
**Owner**: DevNguyen
