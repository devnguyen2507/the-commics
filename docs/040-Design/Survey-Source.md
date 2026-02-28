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

## 4. Danh sách ưu tiên (Priority Items)

### 4.1. Nhóm Phân loại chủ yếu (Core Categories - Phase 1)
Danh sách các phân loại cần crawl trước để tối ưu SEO, dựa vào data thực tế trên thẻ menu hentaivn:
- **Niche/Hentai Specific**: Ahegao, Maid, Horror, Nữ văn phòng, Lỗ nhị, Vếu to, Mông to, Cheating, Time Stop, Mind Break, Harem, Gia đình, Doujinshi, Không che.
- **Form/Style**: Manhwa, Webtoon, Isekai.
- **Structure Tags**: Truyện dài, Truyện ngắn (Oneshot).

### 4.2. Danh sách truyện mẫu (Sample Comic Titles)
Tổng hợp danh sách các truyện cần tập trung crawl để kiểm tra logic Oneshot vs Long-story (Dựa trên cấu trúc route `/truyen/{slug}`):
- Xem chi tiết danh sách tại: [[040-Design/Deep-Survey-Data|Deep Survey Category Data]]

## 5. Output dự kiến
1. **Design Guide**: Bảng màu, Typography, Bộ Icon.
2. **Prototype**: Figma/Sketch cho 3 trang chính (Home, Detail, Reader).
3. **Database Mapping**: Danh sách categories và tags chuẩn từ hentaivn.
4. **Initial Data Batch**: Danh sách CSV/JSON chứa comic-id và categories tương ứng của batch đầu tiên.

---
_Owner: DevNguyen_
