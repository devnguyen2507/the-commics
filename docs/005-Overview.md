# 005-Tổng quan dự án: Commics

## Mục tiêu dự án
Dự án **Commics** tập trung vào việc xây dựng hệ thống tự động thu thập (crawling) nội dung truyện tranh và truyện chữ từ nhiều nguồn trên internet, sau đó cung cấp giao diện đọc truyện tối ưu cho người dùng.

## Định hướng SEO
Dự án đặc biệt chú trọng vào việc tối ưu hóa SEO cho các từ khóa ngách:
- Truyện tranh/truyện chữ theo thể loại: Hentai, Cô giáo, Ngoại tình, Ăn mẹ trước (Step-mother/NTR scenarios), v.v.
- Tối ưu hóa Categories và Tags để bao phủ tối đa các từ khóa tìm kiếm.
- Tự động tạo Site maps và SEO-friendly URL cho từng Chapter.

## Phạm vi hệ thống
Hệ thống bao gồm các module chính:
1. **Survey & Design**: Nghiên cứu thị trường và thiết kế UI/UX (Mobile First).
2. **Database**: Lưu trữ dữ liệu truyện, chapter và cache.
3. **Crawler**: Hệ thống worker tự động thu thập dữ liệu (Temporal).
4. **GraphQL Service**: API layer cung cấp dữ liệu cho FE.
5. **CDN (imgflux)**: Xử lý và phân phối hình ảnh tối ưu.
6. **Frontend (Astro)**: Web app hiệu năng cao, tối ưu SEO.

## 7. Tiến độ thực thi (Master Task List)

**Phase 1: Architecture & QA Spec (✅ Done)**
- [x] Đánh giá QA Review cho Đặc tả Crawler & Database.
- [x] Đánh giá QA Review cho CND, GraphQL & Frontend.
- [x] Bản vá PRD & Technical Spec tổng thể.
- [x] Tạo `Acceptance-Criteria.md` (Checklist nghiệm thu Code & Static Analysis).
- [x] Tạo `Test-Plan.md` (Kịch bản Test chi tiết TDD và Live Test).
- [x] Khởi tạo `Spec-Architecture.md` (Quy hoạch thư mục Monorepo & Docker Profiles).
- [x] Scaffold (Tạo khung) thư mục `src/`, `ops/`.

**Phase 2: Crawler Engine Implementation V2 (✅ Done)**
- [x] Setup `ops/docker/docker-compose.yml` (Tách Temporal-DB và Business-DB).
- [x] Refactor Architecture: Strategy Pattern cho Parsers, Structured Logging.
- [x] Implement Asset Management System (Stage 1: Extract -> Stage 2: Persist).
- [x] Slug-based ID system & Diesel Migration inside Crawler context.
- [x] Incremental Sync logic (Check update dựa trên Worker Metadata).
- [x] Live Verification (Images ordering, Local Storage Bind Mount).

**Phase 3: Database & GraphQL API Layer (✅ Done)**
- [x] Setup Diesel Migration & Auto-gen Source (Part of Crawler V2).
- [x] Thiết lập GraphQL Schema dựa trên Migrations của Crawler.
- [x] Viết Resolvers phân trang Relay Connection.
- [x] Cấu trúc LRU Cache Memory & Redis Standalone.

**Phase 4: CDN ImageFlux (✅ Done)**
- [x] Config Webp Encoder & Magic Bytes Validation.
- [x] Áp dụng Atomic File Lock (Chống Thundering Herd).

**Phase 5: Frontend UI & Reader (✅ Done)**
- [x] Render Layout Astro Components.
- [x] SSR SEO Engine & Image Placeholder (CLS = 0).
- [x] History Storage (Browser-only Quota Limit Caching).
- [x] Integrated Category & Comic SEO content boxes.

**Phase 6: CMS & SEO Operational Refinement (⏳ Progressing)**
- [x] Build Unified SEO Editor (full-page editing for all content).
- [x] Category Management API & UI (list, create, update categories).
- [x] Static Site SEO Audit & QA Checklist.
- [ ] Automated sitemap ping & verification.

---
_Cập nhật lần cuối: 2026-03-01 / Tác giả: Agent SoiBot x DevNguyen_
