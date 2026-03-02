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
- `comics(first, after, filter, sort)`: Relay-compliant list with caching.
- `comic(comicSlug)`: Detailed metadata with auto-resolved nested chapters.
- `chapter(chapterId)`: Full reading payload with image dimensions (`w`, `h`) to eliminate Layout Shift.
- `categories`: Global navigation data.

## 5. Deployment
- **Dockerized**: Multi-stage `Dockerfile` (Alpine-based) for minimal footprint.
- **Orchestrated**: Service `commics-graphql` added to `ops/docker/docker-compose.yml`.
- **Exposed Port**: `18000` (Mapping internal `8000`).

---
**Status**: COMPLETED & ARCHIVED
**Date**: 2026-03-02
