---
id: Spec-006
type: technical-spec
status: draft
project: commics
owner: "DevNguyen"
tags: [frontend, astro, seo, reader]
created: 2026-03-01
updated: 2026-03-01
linked-to: [[020-Requirements/PRD-Frontend]]
---

# Spec: Giao diện Người dùng (Astro Frontend)

Tài liệu này vạch ra giải pháp công nghệ đáp ứng bài toán về Tốc độ (Performance), Tìm kiếm (SEO Engine) và Trải nghiệm đọc (Reader UX) đỉnh cao theo kiến trúc "Island Architecture" của Astro.

## 1. Hiện trạng & Yêu cầu Bố cục (Layout Requirements)

Hệ thống Frontend cần tải cực nhanh (SSG/SSR) đối với các nội dung SEO, đồng thời xử lý hành vi người dùng bằng Javascript động cho chức năng lazy-load.

### 1.1. Ba loại màn hình chính
Đặc tả chi tiết 3 bố cục trang cốt lõi của ứng dụng:

1. **Trang Danh sách (List Pages)**:
   - *Bao gồm*: Trang Chủ (Home), Trang Danh sách theo Thể loại (Category Tag Pages), Trang Kết quả tìm kiếm.
   - *Bố cục*: Grid hiển thị thẻ truyện (thumbnail, tên, rating, số chapter). 
   - *Chức năng*: **Phân trang (Pagination)** bắt buộc phải có để xử lý số lượng truyện lớn. Dữ liệu danh sách có thể lazy-load.
   
2. **Trang Chi tiết Truyện (Comic Detail Page)**:
   - *Bố cục*: 
     - Thông tin chi tiết truyện (Bìa, Tên, Tác giả, Description, Status, Rating). Đây là nội dung quan trọng nhất cho SEO.
     - Danh sách chương (Chapter list) có thể scroll/pagination nếu quá dài.
     - Danh sách truyện đề xuất (Recommended / Có thể bạn sẽ thích).
     
3. **Trang Đọc Truyện (Chapter Reading Page)**:
   - *Bố cục*: Luồng cuộn dọc (Long strip) chứa danh sách hình ảnh của truyện.
   - *Điều hướng*: Thanh công cụ (Floating Navbar) trượt ẩn/hiện chứa các link: Next Chapter, Previous Chapter, Cuộn lên đầu trang (Top), Cuộn xuống cuối trang (Bottom).

### 1.2. Mở rộng Hệ thống Điều hướng & SEO
- **Breadcrumbs**: Bắt buộc có cấu trúc Breadcrumbs rõ ràng (VD: `Trang chủ > Thể loại > Tên truyện > Chapter 1`) để người dùng dễ định vị và Google Bot hiểu cấu trúc site.
- **Tiêu chuẩn SEO Khắt khe**:
  - Chỉ duy nhất **1 thẻ H1** trên mỗi trang, chứa từ khóa SEO trọng tâm (Tên truyện ở trang chi tiết, Tên danh mục ở trang Category).
  - Tối ưu SSR (Server-Side Rendering) cho các vùng nội dung cần SEO (Box thông tin truyện, Tên truyện, Tags, Text description).
  - Lazy load cho các dữ liệu API như danh sách truyện đề xuất hoặc mảng hình ảnh. Nếu chưa tải được hình, JS vẫn render trước thuộc tính `alt` chứa từ khóa mô tả để bot đọc được nội dung ảnh.
  - **Canonical Tags**: Phải trỏ đúng URL gốc để tránh duplicate content.
  - **Sitemap & Robots**: Sitemap.xml được tự động sinh (auto-generated) bằng Astro. File `robots.txt` luôn mở cho phép index toàn bộ content crawl được.

---

## 2. Sơ đồ Kiến trúc Kết nối (Architecture Diagram)

Dưới đây là sơ đồ Mermaid thể hiện bức tranh toàn cảnh kết nối giữa Frontend, CDN và hệ thống API:

```mermaid
graph TD
    Client[Người dùng / Trình duyệt] --> FE[Astro Frontend App]
    GoogleBot[Google Crawler] --> FE
    
    subgraph Astro Frontend
        SSR[SSR Engine: Render SEO Box, H1, Breadcrumbs]
        ClientJS[Client JS: Lazy Load, Pagination, UI State]
    end
    
    FE --> SSR
    FE --> ClientJS
    
    SSR -->|Fetch metadata & Initial Data| GQL[GraphQL API Layer]
    ClientJS -->|Fetch Lazy Lists / Pagination data| GQL
    
    ClientJS -->|Load Images natively via &lt;img src&gt;| CDN[imgflux CDN Edge]
    
    CDN -.->|Cache Miss| Storage[(Disk Storage)]
    GQL -.->|Query| DB[(PostgreSQL / Redis)]
    
    style FE fill:#ff9900,stroke:#333,stroke-width:2px
    style CDN fill:#00cc66,stroke:#333,stroke-width:2px
    style GQL fill:#3399ff,stroke:#333,stroke-width:2px
```

---

## 3. Giải pháp Kỹ thuật (Proposed Solution)

### 3.1. Framework Lõi: Astro.build
Đem lại lợi thế cạnh tranh tuyệt đối khi đấu trường làm nội dung comic cần SEO bứt phá.
- **Partial Hydration (Astro Islands)**: Đa số giao diện text HTML, box thông tin SEO sẽ được server xuất ra toàn bộ dạng tĩnh (SSR) không kèm 1 byte mảng JS.
- Mạch tương tác (Như Client-side Routing, Button Next/Prev, Modal Reader, Pagination) được load JS qua directive `client:idle` hoặc `client:visible`.

### 3.2. Cấu trúc Routing & Canonical
- Dynamic Routes của Astro sẽ tự động inject thể `<link rel="canonical" href="..."/>` khớp với request path.
- Sitemap integration: Sử dụng `@astrojs/sitemap` để build sitemap động mỗi khi có route truyện mới.

### 3.3. Động cực đại hoá hình ảnh (Alt-Text Strategy & CLS = 0)
- Khai báo component `<Image>` đọc từ API CDN `imgflux`.
- **Tránh nhảy trang (Cumulative Layout Shift = 0)**: Dữ liệu API GraphQL cho mảng Chapter Images truyền vào phải là Array Objects chứa Image Dimensions (`[{"file": "x", "w": 800, "h": 1200}]`). Component Frontend Astro dựa vào size đó Render sẵn thẻ Box placeholder `<div style="aspect-ratio">` chống sụp khung trước khi ảnh thực từ CDN chạy về.
- Khi load trang chapter, mảng `alt` tĩnh chứa context (VD: "Tên truyện - Chapter X - Page Y") được SSR render sẵn. Quá trình tải thực tế (src) được defer bằng Lazy Load hoặc Intersection Observer. Điều này giúp dù ảnh load chậm/chưa có, SEO text vẫn hiện diện.

### 3.4. Quản lý Tracking Trạng thái (Browser Only)
- Khách tự lưu bookmark và History thông qua `LocalStorage`. Hoàn toàn cấm Network POST Tracking Call chọc vào GraphQL Layer (Stateless). 
- **Chống Tràn Quota**: Vì LocalStorage cực bé (~5MB), bắt buộc Component Sync Storage phải áp dụng cấu trúc **Eviction Slice**: Mảng History/Bookmark chốt tối đa 500 Object. Vượt ngưỡng sẽ tự Pop() đuôi để thoát lỗi `QuotaExceededError`.

## 4. Phân tích Kiến trúc Component (DevNguyen's Insight)

Một vấn đề cần giải quyết triệt để: **Memory Leak & Trải nghiệm lướt chương siêu dài**.

### 4.1. Content-Visibility và Intersection Observer
- Astro Layout tại Page Reader kết hợp logic gắn CSS Property thuần tuý `content-visibility: auto` kích hoạt ảo hoá (Virtualization) trên Browser. Những dải vùng ảnh nằm ngoài màn hình chưa tới kịp sẽ không bị Engine Browser tập trung xử lý.
- Floating Navbar UI: Các nút điều hướng (Next/Prev/Top/Bottom) sẽ được gắn trong Navbar thông minh. Kéo xuống (Scroll down) -> `transform: translateY(-100%)` trượt giấu đi, kéo lên (Scroll up) -> Hiện lại. Cực kì mượt mà nhờ Passive Event Listener.

---

## 5. Kiến nghị triển khai

- **Tailwind CSS Strategy**: Viết class Tailwind ngay trong thẻ markup của Astro file.
- **Pre-Fetching Caching**: API gọi từ GraphQL cho các dữ liệu lazy (như list truyện) được cache chuẩn trên client (VD: SWR) để thao tác Pagination không bị khựng sượng.

## Tham chiếu
- [[020-Requirements/PRD-Frontend]]
- [[030-Specs/Spec-GraphQL]]
- [[030-Specs/Spec-CDN]]
