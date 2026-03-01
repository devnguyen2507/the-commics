---
id: Spec-001
type: technical-spec
status: approved
project: commics
owner: "DevNguyen"
tags: [architecture, repository, structure, docker]
created: 2026-03-01
updated: 2026-03-01
---

# Spec: Kiến trúc Repository & Quản lý Mã nguồn (Architecture Spec)

Tài liệu này định nghĩa cấu trúc lưu trữ và quy trình phát triển cho toàn bộ dự án Commics. Hệ thống được tổ chức theo kiến trúc Monorepo để dễ dàng quản lý đồng bộ giữa các microservices (Crawler, GraphQL, CDN, Frontend) và cơ sở hạ tầng (Ops/Docker).

## 1. Cấu trúc Source Code (Repository Topology)

Thư mục gốc của dự án được chia làm 2 phân vùng chính: `src` (chứa toàn bộ logic code) và `ops` (quản lý hạ tầng deploy & script). 

```text
/commics-repo
├── src/                                # Vùng sinh thái mã nguồn
│   ├── backend/                        
│   │   ├── crawler/                    # Python Temporal Crawler Engine (Chứa Workers/Workflows)
│   │   ├── graphql/                    # Rust App (Template từ api-aggregator-serving)
│   │   │   ├── db/                     # cargo workspace: Entities, libs, schema.rs generator
│   │   │   └── server/                 # cargo workspace: GraphQL Resolvers, Router, Core
│   │   └── cdn/                        # Rust App (Template từ imgflux - Xử lý / Resize / Cache Image)
│   │
│   └── ui/                             # Astro Frontend Web App (Template kế thừa từ repo p1)
│
├── ops/                                # Vùng Hạ tầng và Automation
│   ├── docker/                         # Chứa tất cả config Dockerfiles và docker-compose
│   │   ├── docker-compose.yml          # Setup chạy toàn bộ stack liên đới 
│   │   └── ...
│   └── scripts/                        # Bash/Python Scripts quản lý dự án
│       ├── run-dev.sh                  
│       └── tctl-create-workflow.sh     # Script chuyên để auto-create / trigger Temporal Workflow
│
└── docs/                               # Documents, PRD, Specs & QA
```

## 2. Chi tiết Định nghĩa Root Folders

### 2.1. Thư mục `src/` (Mã nguồn Lõi)
- `backend/crawler`: Chứa toàn bộ Activity, Workflow viết bằng Python tương tác với Temporal.
- `backend/graphql`: Hệ thống lõi trích xuất dữ liệu, cấu trúc bắt buộc clone y nguyên từ template `api-aggregator-serving`. Chia làm 2 workspaces Rust: `db` (Diesel migrations) và `server` (Actix/Axum web + async-graphql).
- `backend/cdn`: Dịch vụ điều phối hình ảnh `imgflux` độc lập, làm nhiệm vụ hứng proxy request WebP trước khi chạm Storage disk.
- `ui`: Thư mục chứa project Astro, Tailwind, Island Architecture cho phép chạy độc lập (kế thừa UI module p1).

### 2.2. Thư mục `ops/` (Phân vùng DevOps & Docker Compose)
Tập trung toàn bộ cấu hình hạ tầng containerized:
- Chứa các **Docker Service Definitions** cho toàn bộ topology phức tạp của dự án. 
- Mọi context build của Docker phải trỏ thẳng từ góc độ root (tức là build trực tiếp context từ folder dự án). Không truyền biến môi trường qua `.env` rời bên ngoài mà **điền chặt (hardcode) mapping Env thẳng vào file `docker-compose.yml`** để quản trị minh bạch, tránh lệch pha.
- Cấu trúc `docker-compose` phân chia theo **Profiles** chặt chẽ:
  - **Profile `infra`**: Khởi động các Base Services như `db` (PostgreSQL), `redis`, `temporal` (Temporal Server, Temporal UI, PostgreSQL/ES nội bộ của Temporal).
  - **Profile `services`**: Khởi động các Microservices của lõi dự án được tự code gồm: `ui` (Frontend Astro), `cdn` (Rust ImageFlux), `graphql` (Rust API App), `crawler` (Python Worker).

### 2.3. Shared Volume (Dữ liệu Lõm Hình Ảnh)
- Nút thắt cổ chai kiến trúc lưu trữ giữa Crawler và CDN được giải quyết bằng **Docker Shared Volumes**.
- Crawler chạy ở vùng `services` sẽ liên tục Crawl và Write (lưu) file ảnh vào volume `/storage_data/`. Khối volume này bắt buộc được Mount (liên kết) dùng chung cho service `cdn`. Qua đó, `imgflux` (Nằm ở Container vùng khác) vẫn có thể đọc Raw Bytes để encode tự do.

## 3. Quy trình Phát triển và Nghiệm thu (Developer Workflow)

Dự án áp dụng chặt chẽ workflow **"Local Code -> Local Test -> Containerize"** để rào bít lỗi phát sinh khi chuyển môi trường. Quá trình phát triển các services phải đảm bảo tuần tự sau:

1. **Giai đoạn Coding & Debugging (Develop Mode)**:
   - Developer thao tác trực tiếp trên các thư mục `src/backend/...` hoặc `src/ui/`.
   - Tiến hành chạy local môi trường (VD: `cargo run`, `npm run dev`) để thực hiện các chức năng.
   - Chỉnh sửa, fix bug cục bộ trên thiết bị cho đến khi app chạy hoàn hảo dựa vào testcases trong `Test-Plan.md`.

2. **Giai đoạn Containerize (Dockerization)**:
   - Ngay sau khi dev cục bộ hoàn tất mà **"chạy ngon lành"**, cấm chuyển ngay sang module khác!
   - Developer bắt buộc phải tạo/cập nhật `Dockerfile` cho service đó.
   - Thêm cấu hình service vào `ops/docker/docker-compose.yml`.
   - Tiến hành chạy lệnh Docker build và run. Nếu phiên bản Docker Compose lên xanh (Green/Healthy), thì Phase này mới được tính là XONG (Done).

3. **Giai đoạn Bàn giao (Moving to Next Part)**:
   - Chỉ khi 1 service đã đóng gói Docker thành công và chạy tích hợp thông suốt với các dịch vụ khác qua môi trường Network Docker, Developer mới được phép dịch chuyển con trỏ sang code phần khác (Ví dụ: Code xong Graphql, build docker pass thì mới sang làm UI/CDN).

---
**PIC Skill**: `cloud-devops` / `monorepo-architect`
**Owner**: DevNguyen
