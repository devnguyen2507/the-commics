# 010-Roadmap & PIC Skills

## Lộ trình phát triển (Phạm vi ban đầu)

### Giai đoạn 1: Survey & Design
- **Mô tả**: Thu thập survey các web truyện (hentaivn.ch, nettruyencom.net) để xác định concept, bộ icon, và logic phân loại. Nghiên cứu bố cục PC/Mobile, logic oneshot vs long-story.
- **Output**: [[040-Design/Survey-Source|Survey Source PRD]], Design prototype (PC/Mobile First), bộ UI Kit.
- **PIC Skill**: `ui-ux-pro-max` (Source: [[.agent/skills/ui-ux-pro-max/SKILL.md]])

### Giai đoạn 2: Database Design
- **Mô tả**: Thiết kế database phục vụ crawling và serving. Sử dụng Postgres và Redis.
- **Yêu cầu kỹ thuật**: Postgres, Redis.
- **Logic**: **Chapter Number phải là STRING**. Tích hợp các trường `worker-` để quản lý tiến trình crawling.
- **PIC Skill**: `postgresql` (Source: [[.agent/skills/postgresql/SKILL.md]])

### Giai đoạn 3: Crawler Engine
- **Mô tả**: Xây dựng hệ thống thu thập dữ liệu đa nguồn.
- **Yêu cầu kỹ thuật**: Python, `ai` scraping lib, `aiohttp`, **Temporal**.
- **Dữ liệu & Cấu trúc**: Metadata đầy đủ. Lưu trữ ảnh raw vào disk: `storage/commics/{id-truyen}/chapter/{id-chapter}/...`
- **Logic**: Chú trọng order logic chương đảm bảo GraphQL phục vụ đúng thứ tự.
- **PIC Skill**: `playwright-skill` (Source: [[.agent/skills/playwright-skill/SKILL.md]])

### Giai đoạn 4: GraphQL API Layer (✅ Done)
- **Mô tả**: Xây dựng layer API dựa trên Rust.
- **Yêu cầu kỹ thuật**: Rust (sử dụng source mẫu), triển khai GraphQL từ 1 schema tích hợp. Cung cấp danh sách và chi tiết truyện/chapter.
- **PIC Skill**: `graphql-architect` (Source: [[.agent/skills/graphql-architect/SKILL.md]])

### Giai đoạn 5: CDN & Image Optimization (✅ Done)
- **Mô tả**: Xử lý và phân phối hình ảnh.
- **Yêu cầu kỹ thuật**: Sử dụng source mẫu `imgflux`. Chỉnh sửa để tối ưu cache và render ảnh cho dự án.
- **PIC Skill**: `cloudflare-workers-expert` (Source: [[.agent/skills/cloudflare-workers-expert/SKILL.md]])

### Giai đoạn 6: Frontend Development
- **Mô tả**: Xây dựng giao diện web tối ưu SEO.
- **Yêu cầu kỹ thuật**: **Astro** (sử dụng source mẫu).
- **Tính năng bắt buộc**: 
    - Site maps tự động.
    - SEO-friendly Chapter pages.
    - Lazy load JS hình ảnh (hiển thị `alt` text khi đang load).
- **PIC Skill**: `react-nextjs-development` (Source: [[.agent/skills/react-nextjs-development/SKILL.md]])

---
_Owner: DevNguyen_

## Quy định dự án (Project Rules)

1. **Rule 01 - Doc Updates**: Tất cả chỉnh sửa yêu cầu lớn nhỏ ĐỀU PHẢI update vào docs từng bộ phận đang làm.
2. **Rule 02 - Skill Assignment**: Từng task, từng bộ phận thực thi phải được phân bổ Skill PIC tương ứng (Index từ `.agent/skills_index.json`).
3. **Rule 03 - Logic Chương**: Luôn đảm bảo logic sắp xếp chương (ordering) chuẩn xác ngay từ bước crawling.
4. **Rule 04 - SEO First**: Metadata và cấu trúc trang web phải ưu tiên SEO (Alt text, Site maps, Chapter SEO).
