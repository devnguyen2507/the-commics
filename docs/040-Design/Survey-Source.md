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

## 5. Output Design và Prototype
Dựa vào phân tích trực quan qua việc trình duyệt tự động truy cập (Browser Survey) và screenshot từ các nguồn HentaiVN và Nettruyen, dưới đây là đặc tả Design System và Prototype cho UI/UX dự án **Commics**:

### 5.1. Design System Guidelines (Chuẩn thiết kế)
- **Theme chủ đạo**: Dark Mode 100% (Màu nền chủ đạo: `#18181B` hoặc `#1A1A1D`). Lợi ích: giúp làm nổi bật artwork sặc sỡ của truyện, chống mỏi mắt cho trải nghiệm đọc lúc đêm khuya (đặc thù của dòng web này).
- **Accent Color (Màu nhấn)**: 
  - Gợi ý sử dụng màu Hồng Neon (`#EC4899`, gradient tìm-hồng như logo HentaiVN) hoặc Xanh Biển Ép (như Nettruyen) để tạo điểm nhấn cho các nút CTA (Tiếp tục đọc, Xem chap đầu).
- **Typography**: 
  - Font: `Inter` hoặc `Roboto` - Đường nét rõ, không chân, tối ưu hiển thị chữ trên luồng di động.
  - Phân cấp: Tựa đề truyện in đậm, bắt buộc sử dụng `line-clamp-2` (giới hạn 2 dòng) để tránh vỡ grid.

### 5.2. Yêu cầu Prototype các Component/Trang chính

#### A. Trang Chủ (Home Page)
- **Navigation Bar**: Cần dính (Sticky) trên cùng, nền tối màu, nổi bật khung Search ở vị trí trung tâm hoặc góc trên màn hình Mobile.
- **Khu vực Xu Hướng (Hot / Trending)**: 
  - Sử dụng Slider ngang hoặc Grid ưu tiên kích thước cover lớn. 
  - Kèm nhãn dán đánh số (VD: Hạng 1, Hạng 2 nổi lớn như Nettruyen).
- **Khu vực Cập Nhật Mới**: 
  - Lưới Grid linh hoạt: Mobile (2-3 cột), Tablet (4 cột), Desktop (6-8 cột). Tận dụng tối đa diện tích hiển thị.
  - Card Truyện: Poster dạng dọc `tỷ lệ 2:3`, phía dưới là Tựa đề truyện và Chap mới nhất được bôi màu để dễ nhìn nhấn.

#### B. Trang Chi Tiết Truyện (Detail Page)
- **Bố cục (Layout)**:
  - Phía trên cùng: Ảnh bìa truyện ở bên trái; Khối Thông tin chi tiết ở bên phải (bao gồm Tựa đề lớn, Đánh giá sao, Lượt xem, Tác giả, và đặc biệt là Danh sách Thể loại dạng Tag bấm được).
  - Khối Action Buttons (CTA): Theo chuẩn HentaiVN cần tách rõ 2 nút có màu nhấn cực mạnh: `[Xem chap đầu]` và `[Xem chap cuối/mới nhất]` căn ngang nhau.
  - Khu vực Danh sách Chapter: Khung liệt kê danh sách cuộn dọc. Mỗi dòng chapter là một nút bấm, diện tích bấm (Tap Target Size) phải cao (>44px) hỗ trợ di động.

#### C. Trang Đọc Truyện (Reader Page - Chức năng Cốt lõi)
- **UX Cốt lõi**: Liên tục cuộn dọc (Vertical Scroll), viền lề (padding) hình ảnh là cực kỳ nhỏ hoặc bằng 0, hình ảnh nối khít nhau (nhất là mảng Webtoon).
- **Nền trang đọc**: Đen tuyệt đối `#000000` để tập trung hoàn toàn vào nội dung ảnh.
- **Hệ thống Điều hướng (Controls)**:
  - Header và Footer nổi báo Chapter hiện tại sẽ TÀNG HÌNH (Fade out) khi User đang cuộn xuống, và HIỆN LẠI (Slide down/up) lập tức khi vuốt nguợc lên nhẹ hoặc Tap giữa màn hình.
  - Góc cuối hình ảnh Chap cần có thanh chuyển Nhanh (Next/Prev Chapter) bự để chuyển cực lẹ mà không cần kéo lại lên đầu.

---
*Ghi chú: Toàn bộ CSS Rule liên quan đến Prototype sẽ được xây dựng trên Astro framework dựa sát theo kết quả phân tích UX/UI từ các top site này.*

---
_Owner: DevNguyen_
