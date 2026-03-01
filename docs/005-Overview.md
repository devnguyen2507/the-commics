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

**Phase 2: Crawler Engine Implementation (🔄 In Progress)**
- [ ] Setup `ops/docker/docker-compose.yml` (Profile `infra` gồm PostgreSQL, Temporal).
- [ ] Khởi tạo dự án Python (`uv`) tại `src/backend/crawler`.
- [ ] Viết Models Database (SQLAlchemy) cấu hình Upsert Logic.
- [ ] Implement proxy & hoạt động User-Agent Rotation.
- [ ] Dev: **Workflow 1** (Comic Metadata -> Get ID -> Trigger WF 2).
- [ ] Dev: **Workflow 2** (Tải Ảnh vật lý, Tính toán Order Index).
- [ ] Chạy *Live Checks TC-LIVE-01 tới 03* (Validation Parsing & Image bytes).
- [ ] Đóng gói Docker Crawler (`services` profile).

**Phase 3: Database & GraphQL API Layer (⏳ Todo)**
- [ ] Setup Diesel Migration & Auto-gen Source.
- [ ] Cấu trúc LRU Cache Memory & Redis Standalone.
- [ ] Viết Resolvers phân trang Relay Connection.

**Phase 4: CDN ImageFlux (⏳ Todo)**
- [ ] Config Webp Encoder & Magic Bytes Validation.
- [ ] Áp dụng Atomic File Lock (Chống Thundering Herd).

**Phase 5: Frontend UI (⏳ Todo)**
- [ ] Render Layout Astro Components.
- [ ] SSR SEO Engine & Image Placeholder (CLS = 0).
- [ ] History Storage (Browser-only Quota Limit Caching).

---
_Cập nhật lần cuối: 2026-03-01 / Tác giả: Agent SoiBot x DevNguyen_
