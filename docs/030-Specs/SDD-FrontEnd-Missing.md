# Tài Liệu Đặc Tả: Tối Ưu Hóa & Bổ Sung SEO Frontend (SDD-FrontEnd-Missing)

## 1. Mục Đích (Purpose)
Bản đánh giá này liệt kê chi tiết những thiếu sót về yếu tố chuẩn SEO (các thẻ Meta, Open Graph, Twitter Cards, cấu trúc JSON-LD và RSS feed) trên toàn bộ hệ thống dự án Frontend (viết bằng Astro) và đề xuất phương án triển khai chi tiết cho các trang được đánh index/follow. Điều này giúp cải thiện đáng kể thứ hạng, khả năng hiển thị rich snippets trên Google và hiển thị link pre-view đầy đủ trên các MXH (Facebook, Twitter, Zalo).

## 2. Các Lỗi & Thiếu Sót Hiện Tại (Current Issues)

### 2.1. Ở Mức Component Cốt Lõi (`BaseHead.astro` và UI Components)
Hiện tại `BaseHead.astro` đang thiếu nhiều thẻ meta quan trọng và một số thẻ cấu hình sai:
- **Thiếu thẻ Open Graph cơ bản:**
  - `og:site_name` (Ví dụ: tên trang web)
  - `og:locale` (Nên cấu hình là `vi_VN`)
  - Kích thước ảnh đại diện & văn bản thay thế: `og:image:width`, `og:image:height` (Khuyến nghị: 1200x630), và `og:image:alt`
- **Lỗi hiển thị thẻ Twitter Card:**
  - Đang sử dụng thuộc tính `property="twitter:..."` thay vì chuẩn `name="twitter:..."`. Dù một số nền tảng vẫn parse được nhưng về mặt kĩ thuật là sai chuẩn.
  - Thiếu `twitter:image:alt` và `twitter:site` (tùy chọn nhưng khuyến khích).
- **Trải nghiệm truy cập (Accessibility & Image SEO):**
  - Nhiều thẻ hình ảnh và đặc biệt là các icon SVG đang thiếu thuộc tính văn bản thay thế (`alt` cho ảnh, `aria-label` hoặc `aria-hidden="true"` cho SVG). Nếu không có, Google sẽ gặp khó khăn khi hiểu ngữ cảnh hình ảnh/biểu tượng, làm giảm điểm Best Practices và khả năng index Image Search.
- **Thiếu tính tổng quát và mở rộng (Scalability):**
  - Hệ thống props SEO cấp cho `BaseHead` hiện tại là các property rời rạc (`title`, `description`, `image`). Quy trình tạo schema JSON-LD đang bị rải rác ở từng trang, thiếu một cơ chế nhận cấu hình `jsonld` đồng nhất (ví dụ mảng breadcrumbs, article, v.v.) qua BaseHead để tự động render. Các trang mới thêm vào sẽ rất dễ bị bỏ quên schema.
- **Thiếu RSS Feed:**
  - Codebase hoàn toàn chưa có script sinh RSS feed (`rss.xml`) và thẻ link meta RSS ở phần `<head>`.

### 2.2. Về Structured Data JSON-LD (Schema.org)
Mặc dù URL `index.astro`, `truyen/[slug].astro` và trang chapter đã cấu hình tương đối cơ bản một số Schema.org, nhưng việc khai báo chưa có kiến trúc tổng quát và bộc lộ các vấn đề sau:
- **Kiến trúc BreadcrumbList phân mảnh:**
  - Tại các trang `truyen/[slug].astro` và `chap-[chapterNum].astro`, thẻ BreadcrumbList đã tồn tại nhưng bị hard-code JSON rải rác ở từng trang. Cần thiết kế một module/utility xử lý Breadcrumb Schema chuẩn hóa từ đầu (Tuyến: `Trang chủ` > `Thể loại` > `Tên truyện` > `Tên chương`), để cả UI hiển thị và JSON-LD của search engine đều sử dụng chung một nguồn dữ liệu (DRY principle). Các trang mới chỉ cần truyền array cấu trúc là sẽ có ngay schema list.
- **Thành phần còn thiếu trên trang chủ (`index.astro`):**
  - Thiếu Schema `Organization` (hoặc `Publisher`) được liên kết với `WebSite` Schema.
- **Trang chưa có chuẩn JSON-LD Schema (Trống rỗng):**
  - `/the-loai/index.astro` (Danh sách thể loại)
  - `/truyen-hot.astro` (Trang truyện Hot)
  - `/truyen-moi.astro` (Trang truyện Mới)
  - Chưa khai báo Schema cho các trang tổng hợp nội dung này. Cần khai báo `CollectionPage` và `BreadcrumbList`.
- **Trang Tìm kiếm (`/tim-kiem.astro`):**
  - Chưa được định tuyến chuẩn SEO (Khuyến nghị thêm meta `<meta name="robots" content="noindex, follow" />` nếu chưa có để ngăn index kết quả tìm kiếm rác tránh duplicate content).

---

## 3. Kế Hoạch Triển Khai (Implementation Plan)

### Pha 1: Thiết Kế Kiến Trúc SEO Tổng Quát & Cập Nhật Cốt Lõi
1. **Thiết kế lại luồng truyền JSON-LD & SEO Props:**
   - Nâng cấp `BaseHead.astro` để cấu trúc lại interface `Props`, bổ sung mảng dữ liệu `schema` linh hoạt.
   - Viết Schema helper (ví dụ sinh `BreadcrumbList` từ array cấu trúc định sẵn), đảm bảo cứ cung cấp list Breadcrumb UI là tự động có Breadcrumb JSON-LD, tạo tính bền vững khi scale nhiều trang.
2. **Sửa đổi các Meta tags (`BaseHead.astro`):**
   - Cập nhật chuẩn Open Graph: Thêm thuộc tính `site_name`, `locale`, `image:width`, `image:height`, `image:alt`.
   - Chỉnh sửa đồng loạt các thẻ meta twitter từ `property` sang `name`. Thêm `name="twitter:image:alt"`.
3. **Chuẩn hoá Alt Image, SVG và Accessibility:**
   - Quét qua toàn bộ thư mục `/components/` và trang tĩnh để rà soát: mọi thẻ `<svg>` đều phải gắn chuỗi `aria-hidden="true"` (nếu là trang trí) hoặc `aria-label` (nếu là icon tương tác).
   - Đảm bảo thẻ `<img />` có đầy đủ thuộc tính `alt` mô tả nội dung ảnh để pass chốt chặn Accessibility và hỗ trợ Image Indexing.
4. **Khai báo RSS Feed:**
   - Tạo Endpoint `/src/pages/rss.xml.ts` sử dụng dữ liệu GraphQL mới nhất, giới hạn bằng biến `STATIC_BUILD_LIMIT` được quy định. Liên kết `<link rel="alternate" type="application/rss+xml" href="/rss.xml" ... />` ở `BaseHead`.

> **[!CAUTION] LƯU Ý KHI RENDER DỮ LIỆU SEO**
> Đối với mọi thẻ `<meta name="description">` hay nội dung description thuộc object của Schema JSON-LD, TUYỆT ĐỐI không lấy giá trị `duration` trả về từ API backend (`comic.description`, `chapter.description`). Giá trị description API chứa Rich Text HTML và có nhiệm vụ dùng để render text Box Nội Dung trên view. Đối với thẻ SEO, sử dụng Text Static Template, ví dụ: `"Đọc truyện xyz vietsub cực hay...".`

### Pha 2: Cấu trúc dữ liệu JSON-LD (Schema.org)
Tiến hành thêm hoặc chuẩn hoá nội dung `application/ld+json` ở các route:
1. **`src/pages/index.astro` (Trang chủ)**
   - Thêm `Organization` Schema cùng với `WebSite`.
2. **`src/pages/the-loai/index.astro` (Tất cả Thể loại)**
   - Bổ sung Schema `CollectionPage` và `BreadcrumbList` (Trang chủ > Thể loại).
3. **`src/pages/truyen-hot.astro` & `src/pages/truyen-moi.astro`**
   - Bổ sung Schema `CollectionPage` và `BreadcrumbList` (Trang chủ > Truyện Hot/Mới).
4. **`src/pages/the-loai/[slug].astro`**
   - Bổ sung `ListItem` cho các truyện xuất hiện trong CollectionPage đó để Google biết sự liên kết thư mục (Tùy chọn nâng cao).
5. **Đánh giá lại trang `/tim-kiem.astro`**: 
   - Thêm meta `<meta name="robots" content="noindex, follow" />` nếu chưa có để ngăn index rác nhưng giữ follow các url con, HOẶC thêm Schema `SearchResultsPage` nếu cố tình đánh index từ khoá trend. (Khuyến nghị: `noindex, follow`).

### Pha 3: Testing & Validation
1. **Local Preview:** Build tĩnh cục bộ và test các thẻ thông qua DevTools.
2. **Validation Tool:** Export HTML file hoặc sử dụng ngrok để chạy URL qua **Google Rich Results Test** và **Schema Markup Validator** để xác minh JSON-LD chính xác. Lỗi syntax (nếu có) sẽ lộ ngay trong quá trình này.
3. Chạy lệnh build kiểm tra sự cố tương thích khi parse RSS (có các ký tự đặc biệt).

## 4. Tài Liệu Tham Khảo Thêm
- [Astro RSS Docs](https://docs.astro.build/en/guides/rss/)
- [Open Graph specs](https://ogp.me/)
- [Google Search Central: Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
