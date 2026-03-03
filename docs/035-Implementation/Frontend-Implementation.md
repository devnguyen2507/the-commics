# Kế Hoạch Triển Khai Thực Tế: Frontend (Astro)

Tài liệu này ghi nhận kế hoạch triển khai frontend thực tế dựa trên Spec đã lập trước đó, làm rõ kiến trúc luồng dữ liệu, cách map UI và chuẩn hoá CDN.

## 1. Kiến Trúc Luồng Dữ Liệu: Lib -> Adapter -> View

Để đảm bảo tính nhất quán (Consistency) của dữ liệu từ GraphQL API đến Giao diện (Astro Components), dự án sử dụng mô hình Adapter Pattern.
Thay vì truyền thẳng response GraphQL vào Component, mọi dữ liệu đều phải qua Adapter để chuẩn hoá (`mapToView`).

### 1.1 Thư viện kết nối (Lib)
- **File**: `src/lib/api/commics/client.ts`
- **Mục đích**: Chịu trách nhiệm fetch dữ liệu thuần (Raw GraphQL response) qua hàm `GQLFetch`.
- **Yêu cầu an toàn**: GQLFetch phải làm sạch các biến (remove `undefined` keys) để tránh lỗi deserialize từ backend Rust.

### 1.2 Lớp chuyển đổi (Adapter)
- **File**: `src/lib/api/commics/adapters/comic.ts`
- **Mục đích**: Nhận Raw Data và trả về cấu trúc View Model (`ComicView`, `ChapterView`...).
- **Xử lý ngầm**:
  - Xử lý mảng rỗng `[]` hay null fallback mặc định.
  - Định dạng lại hình thức URL (Ví dụ: `slug` -> URL path).
  - Mapping ảnh gốc sang Local CDN URL thông qua hàm `getImageUrl()`.

### 1.3 Lớp Hiển Thị (View / Components)
- **Thư mục**: `src/pages/`, `src/components/ui/`
- **Mục đích**: UI Component nhận View Model thuần túy, tuyệt đối không biết về logic GraphQL hay cấu trúc mảng lồng nhau phức tạp.
- Ví dụ: `<ComicCard comic={comicView} />`

---

## 2. Quản Lý Router & Component Tái Sử Dụng

### 2.1 Các Route Chính
- `/`: Homepage - Chứa HeroSlider và lưới truyện Mới Cập Nhật. Dùng `<ComicCard>`.
- `/truyen-hot`: Danh sách truyện xem nhiều (`sort: MOST_VIEWED`).
- `/tim-kiem?q=keyword`: Trang kết quả tìm kiếm. Đồng nhất lưới truyện như trang chủ. Lọc theo biến query `searchQuery`.
- `/{slug}`: Chi tiết truyện. Hiển thị Chapter List, Nội dung Description.
- `/{slug}/{chapterId}`: Trang đọc truyện (Reader). Chứa logic cuộn ảnh mượt mà và pre-fetch.
- `/the-loai` và `/the-loai/{slug}`: Taxonomy phân loại truyện.

### 2.2 Chuẩn Giao Diện (UI/UX)
- Sử dụng lưới (Grid CSS) responsive từ Mobile (2 cột) lên Layout Desktop (6 cột) thông qua Tailwind classes (`grid-cols-2 md:grid-cols-4 lg:grid-cols-6`).
- Các thẻ truyện (Comic Card) phải giới hạn dòng hiển thị (Line clamp) để tiêu đề không phá layout.
- "Empty States": Bắt buộc có dòng chữ thông báo trống khi mảng API trả về rỗng (VD Tìm kiếm không có kết quả).

---

## 3. Quản Lý Ảnh & Tích hợp CDN (Backend - Frontend Sync)

- **Ảnh Bìa (Cover Image)**: Từ GraphQL, `coverImage` trả về path thô. Ở Frontend, Adapter phải bọc qua helper `getImageUrl(path)` để nối chuỗi tiền tố CDN cục bộ (VD: `/cdn-cgi/image/original/`).
- **Ảnh Chương (Reader Images)**: Backend GQL resolver (`images` list trong `Chapter`) trích xuất `storage_path` bằng cách join bản DB `assets`. Frontend map cái `storage_path` đó qua `getImageUrl(path)` để browser gọi lên container CDN.
- **Biến Môi Trường**: `PUBLIC_CDN_URL` chỉ dẫn URL thực tế của hệ thống CDN.

---

## 4. Dockerization & Runtime Env

Khởi chạy độc lập UI với quy trình Dockerization nhiều giai đoạn (Multi-stage build):
1. **Build Stage**: Cài npm packages và chạy `npm run build` để xuất file tĩnh/bản build server.
2. **Runner Stage**: Copy `dist/` và `node_modules` chạy bằng command `node ./dist/server/entry.mjs`.

**Vấn đề Env Vars trong Astro SSR**:
- `import.meta.env.PUBLIC_*` được bake vào code lúc `docker build` — **không override được lúc runtime**.
- Giá trị cần thay đổi theo môi trường (GraphQL URL, Cache URL) phải đọc qua `process.env` trong server-side code.

**Chiến lược Env**:

| Biến | Đọc bằng | Dùng cho |
|------|----------|----------|
| `GRAPHQL_URL_INTERNAL` | `process.env` (runtime) | SSR fetch tới GraphQL |
| `PUBLIC_GRAPHQL_URL` | `import.meta.env` (build) | Client-side / meta tags |
| `PUBLIC_CDN_URL` | `import.meta.env` (build) | Image URLs trong HTML |
| `CACHE_URL` | `process.env` (runtime) | Redis connection |
| `SITE_URL` | `process.env` (runtime) | Canonical, sitemap base |
| `REVALIDATE_SECRET` | `process.env` (runtime) | Webhook bảo mật |

**Tính Độc Lập Mạng**:
- Container UI không phụ thuộc (`depends_on`) cứng vào `graphql` và `cdn`.
- SSR fetch GraphQL qua `GRAPHQL_URL_INTERNAL` = domain public (không dùng Docker service name để giữ độc lập).

---

## 5. SSR Cache Layer

Chi tiết kiến trúc cache theo **p1 pattern** (đảo ngược từ `p1/src/lib/services/cache/`):

```
getCategories() — withCache → CacheDriver
                                  ├─ L1: LRU Memory (lru-cache, max 5000 keys, TTL 3s)
                                  └─ L2: Redis (ioredis, TTL per-function)
```

### 5.1. Files

| File | Mục đích |
|------|----------|
| `src/lib/cache/redis.ts` | ioredis singleton, đọc `process.env.CACHE_URL` |
| `src/lib/cache/driver.ts` | `CacheDriver`: get/set/del, tag-based invalidation, prefix `commics:` |
| `src/lib/cache/index.ts` | `cacheFetch` (SWR + flight dedupe) + `withCache` HOC + `revalidateTag` |
| `src/lib/api/commics/index.ts` | Wrap `getCategories`, `getComics`, `getComic`, `getChapter` với `withCache` |

### 5.2. CACHE_URL format

```
redis+memory://host:port?ttl=<ms>&lru=<size>&prefix=<pfx>
```

Ví dụ: `redis+memory://redis:6379?ttl=300000&lru=5000`

### 5.3. Cache Invalidation Webhook

Endpoint `POST /api/revalidate` được bảo vệ bằng `Bearer REVALIDATE_SECRET`.
Crawler gọi sau khi save DB → `revalidateTag(['comics'])` → cache bị xóa ngay lập tức.

---

## 6. Sitemap Structure

### 6.1. Vào vấn đề

`@astrojs/sitemap` chỉ sinh URL cho **static routes**, không xử lý được dynamic SSR routes như `/[slug]`, `/the-loai/[slug]`, `/[slug]/[chapterId]`.

Giải pháp: Tạo **custom XML endpoints** fetch data từ GraphQL (qua cache) và trả XML.

### 6.2. Files Sitemap

| File | URLs | Nguồn |
|------|------|--------|
| `sitemap-index.xml.ts` | — (index) | Hardcode 4 lắt |
| `sitemap-page.xml.ts` | `/`, `/truyen-hot`, `/tim-kiem`, `/the-loai` | Static |
| `sitemap-categories.xml.ts` | `/the-loai/[slug]` | `getCategories()` |
| `sitemap-comics.xml.ts` | `/[slug]` | `getComics({ first: 5000 })` |
| `sitemap-chapters.xml.ts` | `/[slug]/[chapterId]` | comics.chapters[] |

### 6.3. HTTP Cache trên Sitemap

Tất cả sitemap endpoints trả header:
```
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

### 6.4. robots.txt

```
User-agent: *
Allow: /
Sitemap: https://domain.com/sitemap-index.xml
```

---

## 7. Check List SEO (Cập nhật)
- [x] `Layout.astro` chuẩn cho toàn trang
- [x] Meta tags cơ bản (`description`, `title`, `og:*`)
- [x] JSON-LD schema (WebSite, Book)
- [x] Breadcrumbs trên tất cả trang
- [ ] `sitemap-index.xml` và 4 sub-sitemaps
- [ ] `robots.txt` trỏ đúng sitemap
- [ ] Canonical URL dùng `Astro.site` đúng domain
- [ ] `SITE_URL` env set đúng domain production
- [ ] SSR Cache layer (Redis + LRU)
- [ ] Revalidate webhook cho crawler
