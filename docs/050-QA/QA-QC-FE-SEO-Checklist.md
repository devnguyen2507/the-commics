# QA/QC Checklist: Frontend & SEO

Tài liệu này định nghĩa chi tiết các hạng mục cần kiểm thử (QA/QC) tập trung vào Frontend (Astro) và điểm chuẩn SEO (Sitemap, Robots, Thẻ Meta, Heading) để tiến hành nghiệm thu.

## 1. Kiểm duyệt SEO (Search Engine Optimization)

### 1.1 Khai báo Crawler (Robots & Sitemap)
- [ ] **robots.txt**:
  - [ ] Tồn tại file `/robots.txt` ở root (VD: `http://localhost:4321/robots.txt`).
  - [ ] Allow cho các User-agent chuẩn (`*`, `Googlebot`, v.v.).
  - [ ] Khai báo đường dẫn trỏ đến Sitemap (VD: `Sitemap: https://domain.com/sitemap-index.xml`).
- [ ] **sitemap.xml**:
  - [ ] Tồn tại file Sitemap hợp lệ (ở `/sitemap-index.xml` hoặc `/sitemap.xml`).
  - [ ] Sitemap liệt kê đầy đủ các trang tĩnh (Home, Thể loại, Truyện Hot).
  - [ ] Sitemap tự động index các trang động (Chi tiết truyện, Đọc Chapter).
  - [ ] URL trong sitemap **không có dấu slash (/) ở cuối** (Trailing slash).

### 1.2 Thẻ Meta & Canonical
- [ ] **Canonical URL**:
  - [ ] Mọi trang đều có thẻ `<link rel="canonical" href="..." />`.
  - [ ] Canonical URL phải là chính nó (self-referencing).
  - [ ] Canonical URL tuyệt đối **KHÔNG có trailing slash**.
- [ ] **Meta Title & Description**:
  - [ ] Mọi trang đều có `<title>` động và thay đổi theo nội dung trang.
  - [ ] Mọi trang đều có `<meta name="description" content="..." />`.
  - [ ] Độ dài title < 60 ký tự, description < 160 ký tự (khuyến nghị).
- [ ] **Open Graph (OG Tags)**:
  - [ ] Có đủ `og:title`, `og:description`, `og:image`, `og:url`, `og:type` để share Facebook/Twitter chuẩn xác.

### 1.3 Cấu trúc Heading (H1, H2, H3)
- [ ] **H1 Quy chuẩn**:
  - [ ] Mỗi trang có **DUY NHẤT một thẻ `<h1>`**.
  - [ ] Trang Chủ: `<h1>` chứa keyword chính (VD: "Đọc Truyện Tranh Online").
  - [ ] Trang Chi tiết: `<h1>` là Tên Truyện.
  - [ ] Trang Đọc: `<h1>` là "Tên Truyện - Chapter X".
- [ ] **Không Duplicate H1/H2**:
  - [ ] Thẻ `<h2>` Không được lặp lại nội dung đã có ở `<h1>`.
  - [ ] Cây Heading phải phân cấp logic (`H1` -> `H2` -> `H3`). Không nhảy cóc từ `H1` xuống `H3`.

### 1.4 Structured Data & JSON-LD
- [ ] **Breadcrumbs (JSON-LD & UI)**:
  - [ ] Có JSON-LD `@type: BreadcrumbList` trên các trang con (Chi tiết truyện, Đọc, Thể loại).
  - [ ] UI hiển thị Breadcrumb chính xác và nhấn được (Cấp 1 > Cấp 2 > Cấp 3).
- [ ] **Schema khác**:
  - [ ] Có schema `WebSite` / `SearchAction` ở trang chủ.
  - [ ] Có schema `CreativeWork` hoặc `Book` ở trang Chi tiết Truyện (kèm rating).

---

## 2. Kiểm duyệt Frontend (Chức năng & Trải nghiệm)

### 2.1 Cấu trúc & Định tuyến (Routing)
- [ ] Không có bất kỳ link gãy (404) nào khi điều hướng giữa các trang.
- [ ] **Route chính xác**:
  - / (Homepage)
  - /truyen-hot (Truyện Hot/Danh sách trending)
  - /the-loai (Danh sách toàn bộ thể loại)
  - /the-loai/{slug} (Truyện lọc theo thể loại)
  - /tim-kiem?q={keyword} (Hoạt động tốt, GET parameter map đúng)
  - /{comic-slug} (Chi tiết truyện)
  - /{comic-slug}/{chapter-slug} (Đọc chapter)

### 2.2 Hiển thị dữ liệu (Data Rendering)
- [ ] **Lib -> Adapter -> View**:
  - [ ] 100% dữ liệu được chuẩn hoá qua Adapter (`mapComicToView`) trước khi đưa ra UI.
  - [ ] Tiêu đề, Hình ảnh, Metadata, URL hiển thị đồng nhất.
- [ ] **Hình ảnh & CDN**:
  - [ ] Tất cả ảnh cover dùng hàm `getImageUrl` để fetch từ local CDN (port 3005).
  - [ ] Tất cả ảnh trang truyện (Reader) fetch từ local CDN thông qua `storage_path`.
  - [ ] **Chống CLS (Cumulative Layout Shift)**: Mọi thẻ `<img>` đều có width/height hoặc `aspect-ratio` dự tính sẵn.
  - [ ] Lazy loading (`loading="lazy"`, `decoding="async"`) cho các ảnh nằm ngoài màn hình đầu tiên.

### 2.3 Giao diện & Trải nghiệm (UI/UX)
- [ ] **Responsive**: Test màn hình Mobile (320px), Tablet (768px) và Desktop (1024px+). Giao diện không bị vỡ.
- [ ] **Comic Grid**: Lưới truyện (ComicGrid) hiển thị 2 cột (mobile) và 4-6 cột (desktop) như thiết kế.
- [ ] **Empty States**:
  - [ ] Có thông báo khi "Không tìm thấy kết quả" trong trang Tìm Kiếm hoặc Thể Loại rỗng.
- [ ] **Performance (Tốc độ)**:
  - [ ] Tránh blocking main thread bằng Javascript.
  - [ ] Các ảnh truyện (Reader) phải load nhanh, mượt tay khi cuộn.
- [ ] **Lỗi SSR/hydration**:
  - [ ] Mở Console (f12), F5 lại trang, đảm bảo không có lỗi chớp chớp giao diện hoặc Warning SSR/Hydration mismatch.

## Hướng Dẫn Nghiệm Thu
1. Tái tạo lại build prod (`npm run build` && `npm run preview`).
2. Tích chọn kiểm kê chéo (Cross-check) với từng dòng trên.
3. Nếu phát hiện lỗ hổng, sửa tại mã nguồn và đánh check lại file này để báo cáo tiến trình.
