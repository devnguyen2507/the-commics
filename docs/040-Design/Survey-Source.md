---
id: PRD-040
type: survey
status: active
project: commics
owner: DevNguyen
tags: [design, survey, hentaivn, research]
created: 2026-03-01
---

# Survey PRD: Source HentaiVN & Design Standards

## 1. Tóm tắt mục tiêu
Phân tích cấu trúc, layout và trải nghiệm người dùng từ các nguồn truyện hentai hàng đầu (bắt đầu với `hentaivn.ch`) để định hình tiêu chuẩn thiết kế (design system) và prototype cho dự án Commics.

## 2. Các nguồn tham khảo (References)
- **Primary**: https://hentaivn.ch/ (Nguồn crawl chính - ưu tiên khảo sát cấu trúc data).
- **Secondary**: 
    - https://vinahentai.site/ (Khảo sát layout hiện đại).
    - https://www.truyen-hentai.com/ (Khảo sát trải nghiệm đọc Mobile).

## 3. Khảo sát chi tiết (Survey Items)

### 3.1. Web Layout & Concept
- **Concept**: Dark mode chuyên nghiệp, tập trung vào hình ảnh chất lượng cao.
- **PC Layout**: 
    - Hệ thống Grid cho danh sách truyện.
    - Banner carousel cho truyện hot/mới cập nhật.
    - Sidebar thông minh hỗ trợ lọc nhanh theo Categories (Cô giáo, Ngoại tình, Học sinh, Oneshot(1 chapter), ...).
- **Mobile First**: 
    - Thao tác cuộn mượt mà.
    - Nút điều hướng chương nổi (floating) để dễ dàng chuyển chapter.

### 3.2. Assets & UI Requirements
- **Dimensions**:
    - Thumbnails: Tỷ lệ dọc chuẩn (ví dụ 3:4).
    - Chapter Content: Chiều rộng tối đa 1200px (PC), full-width (Mobile).
- **UI Elements**:
    - Bộ Icon: Tìm kiếm, Theo dõi, Lượt xem, Like.
    - Thanh Progress Bar khi tải ảnh trong chapter.

### 3.3. Technical Mapping (hentaivn.ch)
- **Selectors**:
    - Comic Info Header: Title, Artist, Tags, Description.
    - Chapter List Table: Số chương (String), Ngày cập nhật.
    - Image Data: Phân tích cơ chế lazy-load của hentaivn để mô phỏng trong Astro.

## 4. Output dự kiến
1. **Design Guide**: Bảng màu, Typography, Bộ Icon.
2. **Prototype**: Figma/Sketch cho 3 trang chính (Home, Detail, Reader).
3. **Database Mapping**: Danh sách categories và tags chuẩn từ hentaivn.

---
_Owner: DevNguyen_
