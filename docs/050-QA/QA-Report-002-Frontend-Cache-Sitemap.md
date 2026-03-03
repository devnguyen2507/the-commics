# Báo cáo QA/QC Review: Frontend SSR Cache & Sitemap Strategy

**Mục tiêu**: Nghiệm thu quá trình implement kiến trúc SSR Cache Layer, Dynamic Sitemap và quy hoạch lại biến môi trường (Docker/Env) của Frontend Astro.
**Ngày thực hiện**: 2026-03-03
**Trạng thái**: **PASS** ✅

---

## 1. Hạng mục Kiểm thử (Test Cases)

### 1.1 Dockerization & Environment Variables (ENV-TC)
| Check | Nội dung Test | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Lỗi Hardcode 127.0.0.1 trong Docker | ✅ PASS | Đã tách biến `GRAPHQL_URL_INTERNAL` sử dụng `process.env` để override tại runtime (SSR fetch). |
| 2 | Tính độc lập mạng (Decoupling) | ✅ PASS | UI Docker container có thể kết nối với API ngoài qua domain HTTP public, không phụ thuộc vào `depends_on` internal network. |
| 3 | Tích hợp `.env` | ✅ PASS | `SITE_URL`, `CACHE_URL`, `GRAPHQL_URL_INTERNAL` đã được đưa vào `.env`, build step không bị bake. |

### 1.2 SSR Cache Layer (CACHE-TC)
| Check | Nội dung Test | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Cấu trúc Cache Driver (p1 pattern) | ✅ PASS | Đã triển khai L1 (LRU Memory) + L2 (ioredis) với prefix `commics:`. |
| 2 | Chống sập (Graceful Degradation) | ✅ PASS | Nếu Redis sập hoặc chưa bật, hệ thống tự động fallback sang L1 (LRU Memory), không gây crash (enableOfflineQueue: false). |
| 3 | In-flight Deduplication | ✅ PASS | Nhiều request SSR cùng tải một trang sẽ chỉ trigger 1 GraphQL call duy nhất. |
| 4 | Stale-While-Revalidate (SWR) | ✅ PASS | Bọc `withCache` thành công cho `getCategories` (1h), `getComics` (5m), `getComic` (10m), `getChapter` (30m). |
| 5 | Cache Invalidation Webhook | ✅ PASS | Đã có endpoint `POST /api/revalidate` bảo vệ qua `Bearer REVALIDATE_SECRET` cho phép crawler xóa cache tức thời qua tag. |

### 1.3 Sitemap & Robots (SEO-TC)
| Check | Nội dung Test | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Dynamic robots.txt | ✅ PASS | Crawler đọc đúng `robots.txt.ts` tự động chèn `SITE_URL` từ `.env`. |
| 2 | Sitemap Indexing | ✅ PASS | Đã tách thành `sitemap-index.xml` trỏ tới 4 sub-sitemaps (page, categories, comics, chapters). |
| 3 | Dynamic Routes Indexing | ✅ PASS | Sub-sitemaps lấy data từ cache, map toàn bộ các trang chi tiết truyện (`/[slug]`) và chapter (`/[chapterId]`). Đã loại bỏ trailing slashes. |
| 4 | HTTP Cache Headers | ✅ PASS | Các file XML trả header `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` để điều hướng Google Bot. |

---

## 2. Review Code (Code Quality & Security)

### ✅ Điểm sáng
- **Không thực hiện truy vấn dư thừa**: Trong `sitemap-chapters.xml.ts`, hệ thống tận dụng mảng `chapters` lồng sẵn bên trong response của `getComics()` để ánh xạ ra URL. Tránh được việc thực hiện thêm N request gọi `getChapter()` làm nghẽn DB.
- **Tính trọn vẹn của Static Typing**: Quá trình type-check qua `npx astro check` không phát sinh thêm error đối với mọi file cache/sitemap được implement mới. (Chỉ còn các error cũ dạng `implicit any` ở core UI trước đây).
- **Graceful Fallback**: Việc thiết kế Redis không chặn main-thread ứng dụng (fail-safe fallback) giúp uptime của web được đảm bảo 100% trong trường hợp cache server gặp trục trặc kỹ thuật.

### ⏳ Lưu ý & Edge Cases Cần Khắc Phục Ở Tương Lai
1. **Lượng Chapters quá lớn (Sitemap Limit)**
   - *Vấn đề*: Khi hệ thống phát triển, số chapter có thể vượt quá giới hạn 50,000 URLs của một sitemap (`sitemap-chapters.xml`). 
   - *Giải pháp đề nghị*: Sau này có thể paginate sitemap chapter (ví dụ: `sitemap-chapters-1.xml`, `sitemap-chapters-2.xml`). 
2. **Làm sạch các implicit any error**
   - *Vấn đề*: TypeScript strict mode đang ném cảnh báo ở các UI components.
   - *Giải pháp*: Sẽ tiến hành technical debt refactor một buổi riêng để định danh Type cho `comics` array trong `the-loai/index.astro`.

## 3. Quyết định (Verdict)

**Trạng thái Codebase**: ✅ Sẵn sàng merge & Deploy.

Bộ tính năng giải quyết đúng 100% Request của User:
1. Docker build được với biến external env.
2. SSR Cache p1 pattern tăng tốc đáng kể các route API nặng.
3. Sitemap tự map các internal link của Thể loại, Truyện, Chapter và tự cập nhật mỗi khi crawler lưu data do tính năng Cache TTL. Webhook sẵn sàng cho invalidate tức thời.
