---
id: PRD-024
type: prd
status: active
project: commics
owner: DevNguyen
tags: [frontend, astro, seo, reader]
created: 2026-03-01
---

# PRD: Giao diện Người dùng (Astro Frontend)

## 1. Tóm tắt điều hành
Frontend Commics tập trung vào trải nghiệm đọc truyện tối ưu trên mọi thiết bị (Mobile First) và khả năng "thâu tóm" traffic từ các công cụ tìm kiếm (SEO). Sử dụng framework **Astro** để đạt hiệu suất cực cao thông qua Static Site Generation (SSG) và Server-Side Rendering (SSR).

## 2. Mục tiêu
- **SEO Tuyệt đối**: Đứng top các keywords về hentai, categories bằng cách tối ưu metadata và URLs.
- **Hiệu năng**: Điểm Lighthouse xanh (90+) cho cả mobile và desktop.
- **UX Reader**: Giao diện đọc truyện mượt mà, không giật lag khi chuyển chapter.

## 3. Tính năng & SEO
- **SEO Engine**:
    - Tự động sinh `sitemap.xml`.
    - URL thân thiện: `/comic/{slug}`, `/comic/{slug}/chap-{number}`.
    - **Alt-Text Strategy**: Hiển thị text thay thế và lazy load JS ảnh để Google Bot dễ dàng index nội dung ngay cả khi ảnh chưa tải xong.
- **Mobile First Focus**: Layout reader cuộn dọc mượt mà, tối giản hóa các thành phần gây xao nhãng.

## 4. Yêu cầu kỹ thuật
- **Framework**: Astro.
- **Data Source**: Truy vấn qua GraphQL API layer.
- **Assets**: Sử dụng link ảnh đã qua tối ưu từ hệ thống CDN (imgflux).

---
**PIC Skill**: `react-nextjs-development`
**Owner**: DevNguyen
