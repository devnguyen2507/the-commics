# Commics GraphQL API Implementation - Change Log

This document serves as the official archival of the implementation work completed for the GraphQL API layer (Phase 3). It details the technical decisions and changes made during development.

## 1. Summary of Work
The GraphQL API was implemented using Rust, featuring `async-graphql` and `axum`. It serves as the bridge between the Astro/Frontend and the PostgreSQL database (populated by Crawler V2).

## 2. Key Architecture Decisions
- **Async DB Layer**: Switched to `diesel-async` with `bb8` pooling for non-blocking I/O.
- **N+1 Prevention**: Implemented `DataLoaders` for Comics, Chapters, and Categories.
- **Two-Tier Caching**:
    - **L1 (Moka)**: Local in-memory LRU cache for high-frequency small objects.
    - **L2 (Redis)**: Distributed cache for chapters and large listing results.
- **Resilient Image Handling**: Added support for both string layouts `["p1.jpg"]` and object layouts `[{"file":"p1.jpg"}]` to handle variations in crawler output.

## 3. Database Changes (Change Log)
The following migrations were added during this phase:
- **`2026-03-02-153000_add_rating_and_views`**: Added `rating_score`, `rating_count`, and `view_count` to the `comics` table to support Frontend sorting and displays.

## 4. GraphQL Schema Highlights
- `comics(first, after, filter, sort)`: Trả về mảng `[Comic]` (Chưa áp dụng Relay Connection chuẩn).
- `comic(comicSlug)`: Detailed metadata with auto-resolved nested chapters.
- `chapter(chapterId)`: Full reading payload with image dimensions (`w`, `h`) to eliminate Layout Shift.
- `categories`: Global navigation data.

## 5. Known Gaps & Future Improvements (Khoảng cách & Cải tiến)
- **Pagination**: Cần chuyển đổi từ `offset-based` sang `cursor-based` (Relay specification) để hỗ trợ lazy-load hiệu quả hơn trên thiết bị di động.
- **Breadcrumbs API**: Cần bổ sung Resolver tính toán Breadcrumbs path từ Category ID để Frontend không phải xử lý logic phức tạp.
- **Data Completeness**: Bổ sung `alternative_titles` và timestamps vào schema GraphQL.
- **Auth Layer**: Chưa triển khai Authentication/Authorization cho các mutation (nếu có sau này).

## 5. Deployment
- **Dockerized**: Multi-stage `Dockerfile` (Alpine-based) for minimal footprint.
- **Orchestrated**: Service `commics-graphql` added to `ops/docker/docker-compose.yml`.
- **Exposed Port**: `18000` (Mapping internal `8000`).

---
**Status**: COMPLETED (With known gaps)
**Date**: 2026-03-02
