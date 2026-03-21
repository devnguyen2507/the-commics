# Implementation Strategy: SEO Keyword Funnel

> **Tham chiếu Spec:** `docs/030-Specs/Specs-SEO-Keyword.md`
> **Trạng thái:** Đang tiến hành (In Progress)

Tài liệu này theo dõi chi tiết tình trạng lập trình (Implementation Status) của chiến lược 4 tầng từ khóa SEO trên hệ thống FanManga.net.

---

## 1. Kiến Trúc Phân Tầng Từ Khóa (Keyword Tier Framework)
- **Tình trạng:** [x] Đã chốt kiến trúc. Phân chia rõ ràng 4 loại trang không dẫm đạp keyword.

## 2. Tier 1 — Core / Seed Keywords (Trang chủ)
**Trạng thái: [x] Hoàn thành (100%)**

- **Các tệp đã sửa đổi:**
  - **`src/ui/src/pages/index.astro`**: 
    - Cập nhật `pageTitle`: `Đọc Truyện Manga, Đọc Truyện Hentai 18+ Không Che - FanManga`.
    - Cập nhật thẻ `meta description` kêu gọi hành động.
    - Chỉnh sửa thẻ `<h1/>` nội dung SEO Body chứa các từ khóa lõi (`đọc truyện manga`, `đọc truyện hentai`, `vietsub`).
  - **`src/ui/src/lib/utils/schema.ts`**:
    - Hàm `generateWebsiteSchema` kết hợp `WebSite` và `Organization` schema.
    - Inject từ khoá mạnh vào thuộc tính `description` của JSON-LD (WebSite). Khai báo ID, LOGO.
- **Tiêu chí Hoàn thành:** Google Bot đọc được metadata chuẩn 100%, có SiteNavigation (action search). H1 bám sát từ khóa lõi.

---

## 3. Tier 2 — Category / Genre Keywords (Trang Thể Loại)
**Trạng thái: [ ] Đang chờ xử lý (Pending)**

**Kế hoạch triển khai:** 
- Nâng cấp `src/pages/the-loai/[slug].astro`. 
- Bổ sung logic tự động ghép biến số `{Tên Thể Loại}` vào Meta Title và Description.  
  *(VD: `Đọc Truyện {Tên Thể Loại} 18+ Hay Nhất | FanManga`)*.
- Cập nhật hàm `generateCollectionSchema` xuất ra metadata của `CollectionPage`, tự liên kết description tương ứng.

---

## 4. Tier 3 — Title / Entity Keywords (Trang Chi Tiết Truyện)
**Trạng thái: [ ] Đang chờ xử lý (Pending)**

**Kế hoạch triển khai:**
- Sửa `src/pages/truyen/[comicSlug].astro` để bind Title / Description với pattern chuẩn Tier 3 *(VD: "Đọc {Tên Truyện} 18+ Tiếng Việt Không Che...").*
- Nâng cấp `generateComicSchema` (JSON-LD) chuyển từ schema hiện tại sang cấu trúc `Book`, điền vào properties: `author`, `genre` và auto-inject yếu tố "18+" vào `name`.

---

## 5. Tier 4 — Action / Chapter Keywords (Trang Đọc Chương)
**Trạng thái: [ ] Đang chờ xử lý (Pending)**

**Kế hoạch triển khai:**
- Sử dụng pattern bọc (wrapper pattern) cho Meta Tags trong `src/pages/doc/[comicSlug]/[chapterSlug].astro` với định dạng `{Tên Truyện} Chap {Số} Vietsub Không Che`.
- Cập nhật `generateChapterSchema` cấu hình schema `Article`:
  - Khai báo bắt buộc `datePublished`.
  - Liên kết Context Tree: dùng `isPartOf` trỏ ngược lại Link Comic Detail.

---

## 6. Technical SEO Bổ Sung

Các hạng mục hạ tầng SEO tổng thể:
- **[x] Cấu trúc URL chuẩn:** Mọi slug đã được hyphenate.
- **[x] Sitemap Strategy:** Đã tách 4 sitemap (`index`, `page`, `categories`, `comics`, `chapters`) và sửa lỗi thiếu item (cập nhật parameter `all: true`).
- **[x] Core Web Vitals:** Tối ưu hóa ảnh tải đầu trên trang hero/chap (`fetchpriority="high"`). Có thể audit thêm khi list dài.
- **[x] Google Favicon Fix:** Khởi tạo định dạng ảnh 48x48 theo chuẩn Google Search để hiển thị logo Brand ngoài màn hình tìm kiếm.
- **[ ] Schema Breadcrumb:** Cần cài đặt trên các template chính (Homepage -> Thể Loại -> Tên truyện -> Chapter) cho Bots một cách tường minh.
- **[ ] Thẻ Canonical:** Cần cài đặt `rel="canonical"` tự động chống phân mảnh traffic cho màn list chương.

---

## 7. Roadmap Sprint Tiếp Theo (Sprint 1)
- Triển khai **Mục 3 (Tier 2 Category Keywords)**. Đẩy metadata cho các trang chuyên biệt nội dung.
- Xác nhận thay đổi qua build preview.
