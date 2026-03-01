---
id: PRD-024
type: prd
status: approved
project: commics
owner: "DevNguyen"
tags: [frontend, astro, seo, reader]
created: 2026-03-01
updated: 2026-03-01
linked-to: [[030-Specs/Spec-Frontend]]
---

# PRD: Giao diện Người dùng (Astro Frontend)

## 1. Tóm tắt điều hành
Giao diện người dùng của dự án Commics dồn mọi sức lực vào hai điểm then chốt: **Trải nghiệm Đọc Truyện** siêu mượt trên điện thoại và **Tối ưu hóa Tìm Kiếm (SEO)** tuyệt đối.
Hệ thống sử dụng framework **Astro** để chia nhỏ các vùng tương tác (Island Architecture), tách biệt giữa phần Khung Server (dành cho Google crawler) và State Browser (Lưu trữ lịch sử không trạm máy chủ).

---

## 2. Kiến trúc Routing, Caching & Data Triggers

```mermaid
graph TD
    User([Người dùng / Browser])
    GBot([Google Bot])

    User --> AstroRouting
    GBot --> AstroRouting
    
    subgraph Astro Frontend Node
        AstroRouting[Trình định tuyến (Router)]
        SSR[Trình Render Box tĩnh (SEO Content)]
        Client[Trình quản lý LazyJS & Browser Storage]
    end
    
    AstroRouting -->|Yêu cầu trang| SSR
    AstroRouting -->|Yêu cầu giao diện động| Client
    
    SSR -->|Fetch Data 1 lần / Build sitemap| GQL[GraphQL API Layer (Rust)]
    Client -->|Lazy Load Images| CDN[CDN Edge imgflux]
    
    Client -.->|Ghi nhận Lịch sử đọc & Yêu thích| Local[Trình duyệt: LocalStorage & IndexedDB]
    
    style SSR fill:#ff9900,color:#000,stroke:#333,stroke-width:2px
    style Client fill:#ffcc66,color:#000,stroke:#333,stroke-width:2px
    style Local fill:#ffffe0,color:#000,stroke:#333,stroke-width:2px
    style GQL fill:#3399ff,color:#fff,stroke:#333,stroke-width:2px
```

## 3. Đặc tả Màn Hình (Views & Rendering Strategies)

Astro sẽ điều hướng toàn bộ nền tảng dựa trên 3 khối màn hình chính. Ở TẤT CẢ các trang, vùng chứa thông tin tĩnh của truyện (SEO Box) bắp buộc phải được render sẵn từ Server (SSR) để bot Google không bị lùng bùng hay đọc thiếu content vì phải đợi JS.

### 3.1. Nhóm Trang Danh Sách (Homepage / Categories / Tag Pages)
- **Bố cục**: Dạng Lưới vỉ (Grid) chứa Thumbnail truyện, Tiêu đề, Tác giả, và Danh sách (hoặc Status) Chapter. Phải hỗ trợ Phân trang (Pagination) mượt mà để chống Lag.
- **Tiêu Chuẩn SEO Content**: Duy nhất 1 thẻ `H1` chứa từ khoá (Ví dụ: "Truyện Webtoon Hentai Mới Nhất"). Bắt buộc tích hợp Breadcrumbs navigation.

### 3.2. Trang Chi tiết Truyện (Comic Detail Box)
- **Bố cục**: Hiển thị Bìa/Logo bên cạnh Title, Author, Description và List Category tags. Phía dưới là danh sách Chương và Truyện recommend (Có thể bạn sẽ thích).
- **Core Requirements**: Toàn bộ thông tin Text Box này (trừ Truyện Recommend) PHẢI được SSR render ra HTML tĩnh sẵn trên server-side. 

### 3.3. Trang Đọc Truyện (The Long-strip Chapter Reader)
Màn hình then chốt có tính sát thương khung hình cực cao (50-100 ảnh tẹt dọc).
- **Floating UI**: Có một thanh điều hướng Navbar (Next, Previous, Tự Scroll lên trên cùng/xuống dưới cùng). Navbar này sẽ chạy JS thụ động: Kéo xuống đọc ảnh -> Trượt ẩn đi Tàng hình. Kéo ngược lên -> Trượt hiện ra trở lại.
- **Xác lập CLS = 0 (Cumulative Layout Shift)**: Không xảy ra hiện tượng "Giật khung hình". Mọi API JSONB trả về Image Info phải bao gồm Parameter mảng width, height (VD: `w: 800, h: 1200`). Astro sẽ dựng box HTML trống (`<div style="aspect-ratio">`) ứng với block size thực tế này trước khi nhồi ảnh lazy load `<img>` vào, giữ màn hình mượt cứng không rớt pixel.
- **Động Cực đại Hình ảnh**: Nếu chưa crawl/load được nội dung bên trong, JS vẫn ghim cứng property thuộc tính `alt="Tên Truyện - Chap XY - Ảnh Z"` để Google quét image index.

## 4. Quản lý Trạng thái (Browser Only Config)

**Tuyệt đối không sử dụng Server Database hoặc API GraphQL để ghi lại nhật ký người dùng.**
1. Khách đi vào web -> Client JS đọc `LocalStorage` hoặc `IndexedDB` của trình duyệt.
2. Từ DB trình duyệt đó, Frontend dựng thanh "Lịch sử đã đọc ghim sẵn", "Bookmark yêu thích".
3. Lợi ích: Tách tải API 99% cho Server backend.
4. **Giới hạn Quota Limit**: Browser chỉ cho phép ~5MB LocalStorage. Code Frontend phải xây dựng chiến lược **Eviction Slice**: Mỗi mảng Mảng Lịch sử Truyện/Đánh dấu Yêu thích chỉ được phép lưu tối đa 500 records mới nhất. Sẽ tự động Pop mảng nếu user đọc vượt ngưỡng, giúp tránh lỗi Panic Client `QuotaExceededError`.

## 5. Quy Chuẩn SEO & Metadata

Theo kinh nghiệm triển khai dự án nội bộ:
- Mọi trang URL đều xuất thẻ Canonical `<link rel="canonical" href="X">` trỏ đúng vào bản thân URL chính chủ nó để triệt để tình trạng Trùng lặp nội dung.
- Sinh (auto-generate) danh bạ Sitemap `sitemap.xml` tự động sau mỗi lần Build/Publish thông qua bộ thư viện của Astro (liên kết đến list URL của API). File `robots.txt` không cần khóa chặn.

---
**PIC Skill**: `react-nextjs-development`
**Owner**: DevNguyen
