# Tổng Hợp QA/QC Checklist SEO Dự Án P1 (Prioritized)

Dựa trên các cấu trúc hiện tại và vấn đề thường gây nhầm lẫn (confuse) trong các dự án dùng SPA/SSR/SSG (đặc biệt là Astro + React/TSX như dự án P1), tôi đã tổng hợp bộ checklist QA/QC SEO toàn diện. Các hạng mục được **sắp xếp theo mức độ ưu tiên xử lý (Priority)** từ cao xuống thấp.

---

## 🛑 PRIORITY 1: CRITICAL (Phải xử lý ngay để được Google Index đúng)
Những vấn đề này quyết định việc Google có nhìn thấy và phân tích được giao diện/nội dung website hay không.

| STT | Vấn đề / Hạng mục | Tiêu chí kiểm tra | Tại sao dễ nhầm lẫn / Lưu ý riêng cho P1 | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **1.1** | **Javascript Rendering (CSR vs SSR/SSG)** | Đảm bảo các nội dung quan trọng không bị ẩn sau JS. | Dự án dùng nhiều React Components (TSX/JSX) với Client-side rendering. Các component render trễ (Skeleton) có thể bị Google crawl nhầm thành nội dung chính. | ⬜ |
| **1.2** | **Quản lý nội dung "Rác" (No-snippet)** | Các text tạm thời như "KHÔNG CÓ TRẬN ĐẤU", Loading Skeleton phải có `data-nosnippet`. | GoogleBot scan HTML thô có thể lấy các placeholder này làm Snippet (Mô tả tìm kiếm), gây mất thiện cảm CTR. | ⬜ |
| **1.3** | **Internal Links (Chuyển hướng nội bộ)** | **100% sử dụng thẻ `<a>`** có thuộc tính `href` trỏ đến URL thực tế. | Trong React, dev rất dễ dùng `<div onClick={router.push}>` làm link. Việc này **giết chết** quá trình di chuyển mạch lạc (crawl) của Spider/Bot. | ⬜ |
| **1.4** | **Trạng thái Indexing & Robots** | Thẻ `<meta name="robots" content="index, follow">` (hoặc noindex nếu page đó ẩn). File `robots.txt` chứa sitemap. | P1 có các trang chức năng/bộ lọc không cần index (tránh Duplicate Content/Cannibalization). Cần set `noindex` rõ ràng cho trang filter động. | ⬜ |
| **1.5** | **Canonical URLs** | Mỗi page bắt buộc có 1 `<link rel="canonical" href="[URL_CHUẨN]">`. | Tránh Google phạt do trùng lặp nội dung khi URL có param (`/?tab=live` vs `/`). | ⬜ |

---

## ⚠️ PRIORITY 2: HIGH (Tác động mạnh trực tiếp đến Xếp hạng & CTR)
Những yếu tố giúp trang web hiển thị đẹp trên Google Search và mạng xã hội.

| STT | Vấn đề / Hạng mục | Tiêu chí kiểm tra | Tại sao dễ nhầm lẫn / Lưu ý riêng cho P1 | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **2.1** | **Title Meta** | Có thẻ `<title>` duy nhất, mô tả chính xác (50-60 ký tự), linh động theo biến. | Dự án thể thao thường có Title động (Ví dụ: "Kết quả [Tên Đội A] vs [Tên Đội B]"). Nếu không build động chuẩn, title sẽ bị trùng toàn trang (Duplicate Titles). | ⬜ |
| **2.2** | **Description Meta** | Có `<meta name="description">` (140-160 ký tự), chứa keyword chính. | Tương tự Title, các trang chi tiết trận đấu cần có description khác biệt thay vì dùng 1 desc mặc định của site. | ⬜ |
| **2.3** | **OpenGraph (Facebook/Zalo) & Twitter Cards** | Đầy đủ `og:title`, `og:description`, `og:image` (1200x630px). | Ảnh OG khi share link trận đấu nên là ảnh lấy từ API (logo 2 đội) thay vì logo trang chủ. Dev quên truyền ảnh vào HTML thì share link sẽ xấu. | ⬜ |
| **2.4** | **Cấu trúc URL Chuẩn (Slug)** | URL sạch, dùng gạch nối (`-`), không chứa ký tự lạ/dấu tiếng Việt. | Các trang danh mục/bài viết lấy từ DB (như WordPress Headless), cần đảm bảo slug luôn được encode chuẩn xác `/ban-tin-bong-da` thay vì `/?category=123`. | ⬜ |
| **2.5** | **JSON-LD Schema Markup** | Các tính năng thể thao cần Schema: `Event` (Trận đấu), `Organization`/`SportsTeam` (Đội bóng). | Nếu không có Schema, Google không hiện Rich Snippet (lịch đấu nổi bật trên kết quả tìm kiếm). Xác thực qua Google Rich Results Test. | ⬜ |

---

## 🟡 PRIORITY 3: MEDIUM (Cấu trúc Semantic & Trải nghiệm On-page)
Yếu tố tạo nền tảng vững chắc để Google hiểu ngữ cảnh nội dung.

| STT | Vấn đề / Hạng mục | Tiêu chí kiểm tra | Tại sao dễ nhầm lẫn / Lưu ý riêng cho P1 | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **3.1** | **Sitemap XML** | Tự động tạo `sitemap.xml` và cập nhật khi có trận đấu/bài viết mới. | Web tĩnh/SSG (Static Site Generation) thường quên gen sitemap mới mỗi khi có page mới sinh ra. | ⬜ |
| **3.2** | **Cấu trúc Thẻ Heading (H1-H6)** | Đúng **1 thẻ H1 duy nhất** mỗi trang. Cấu trúc logic (H1 -> H2 -> H3), không nhảy cóc. | Dev React hay lấy thẻ `<hN>` để làm style cho chữ to nhỏ (thay vì CSS font-weight) làm loạn ngữ nghĩa cấu trúc. | ⬜ |
| **3.3** | **Semantic HTML** | Dùng `<main>`, `<header>`, `<footer>`, `<article>`, `<nav>` thay vì toàn dùng `<div>`. | P1 dùng Tailwind (component-based), rất dễ lạm dụng `<div className="...">`. Google thích đọc các thẻ đánh dấu vùng rõ ràng. | ⬜ |
| **3.4** | **Image ALT tags** | Toàn bộ thẻ `<img>` (logo, cờ team, thumbnail) cần có `alt="Mô tả cụ thể"`. | Ảnh từ CMS trả về có thể thiếu `alt`. Logo clb MU thì phải có `alt="Câu lạc bộ Manchester United"` chứ không phải `alt="logo"`. | ⬜ |
| **3.5** | **Tối ưu Font / Core Web Vitals** | Layout không bị chớp/giật khi load font (CLS). `<script>` tag không block render (`defer/async`). | Các thư viện 3rd party (như Ghost Hyperlink `/gh.js` đang dùng) cần được set `defer` để tránh làm chậm First Contentful Paint. | ⬜ |

---

## ⚪ PRIORITY 4: LOW (Tối ưu nâng cao)
Nên thực hiện sau khi 3 nhóm trên đã chuẩn chỉnh.

| STT | Vấn đề / Hạng mục | Tiêu chí kiểm tra | Ghi chú | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **4.1** | **Lazy Loading** | Thêm `loading="lazy"` cho ảnh `<img ... />` nằm ngoài màn hình đầu tiên (below the fold). | Cải thiện PageSpeed Insights. | ⬜ |
| **4.2** | **Lang tag** | `<html>` luôn có `<html lang="vi">`. | Giúp bot nhận dạng ngôn ngữ trang đích. Đã có trong `Layout.astro`. | ⬜ |
| **4.3** | **Tốc độ Lighthouse SEO** | Core Web Vitals đạt chỉ số xanh (LCP < 2.5s, CLS < 0.1). | Tốc độ là tín hiệu quan trọng của Google. Astro khá nhẹ nên cơ bản sẽ tối ưu, chỉ cẩn thận JS ở phía client. | ⬜ |

---

## 💡 Phương Pháp Test (Dành cho QC/QA)
1. **Dùng NoScript Extension:** Tắt JS toàn bộ, f5 trang web xem nội dung nào còn hiển thị -> Đó là nội dung Google thấy được.
2. **Dùng "Inspect Element" vs "View Page Source":**
   - **Page Source (Ctrl+U):** Những gì có trong này là Google bot thấy rõ nhất ở lần crawl đầu (Initial HTML). Quan trọng cho SEO.
   - **Inspect (F12):** Là DOM sau khi React/JS đã can thiệp thay đổi cấu trúc ở Client.
3. **Công cụ Check:**
   - Cài extension **SEO META in 1 CLICK** (để soi H1, H2, Title, Canonical nhanh).
   - Truy cập **[Google Rich Results Test](https://search.google.com/test/rich-results)** để check JSON-LD / Schema có hợp lệ không.
   - Cài extension **Lighthouse** quét lỗi Accessibility/SEO tự động.