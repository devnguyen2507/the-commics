# Technical Specifications (Specs): SEO & CMS

## 1. System Architecture
Hệ thống CMS gồm 2 thành phần chính:
- **`cms/api`**: Backend API viết bằng Python (FastAPI).
- **`cms/fe`**: Frontend Web viết bằng React (Vite).
Cả hai sẽ được đóng gói bằng Docker và cấu hình chạy với `network_mode: "host"` để dễ dàng kết nối với Database PostgreSQL hiện tại của hệ thống.

## 2. Backend Specifications (`cms/api`)

### 2.1. Core Tech
- Framework: FastAPI
- Database ORM: SQLAlchemy (kết nối trực tiếp vào DB PostgreSQL của Rust hiện tại)
- Database Driver: `psycopg2-binary` hoặc `asyncpg`
- Authentication: JWT Auth (JSON Web Token)

### 2.2. Authentication (Single Role)
- App sẽ tạo cấu hình tài khoản Admin tĩnh qua biến môi trường (ví dụ: `ADMIN_USER=admin`, `ADMIN_PASS=supersecret`).
- Khi client login, backend trả về JWT token. Các API sửa đổi dữ liệu bắt buộc truyền Header `Authorization: Bearer <token>`.

### 2.3. Endpoints (RESTful API)
*(Tất cả APIs bảo vệ bằng JWT ngoại trừ `/api/auth/login`)*

- **Auth**
  - `POST /api/auth/login`: Nhận `{username, password}` -> Trả về Token.

- **Comics**
  - `GET /api/comics`: Danh sách truyện, hỗ trợ Pagination và Search nhẹ.
  - `GET /api/comics/{id}`: Lấy chi tiết truyện + SEO data.
  - `PUT /api/comics/{id}`: Cập nhật thông tin Truyện.
    - Payload: `{ is_publish: boolean, title: string, description: string }`

- **Chapters**
  - `GET /api/chapters`: Lấy danh sách Chapter (Query param `?comic_id=xxx`).
  - `GET /api/chapters/{id}`: Chi tiết 1 chapter.
  - `PUT /api/chapters/{id}`: Cập nhật thông tin Chapter.
    - Payload: `{ is_publish: boolean, description: string }`

- **Categories**
  - `GET /api/categories`: Danh sách thể loại.
  - `GET /api/categories/{id}`: Chi tiết thể loại.
  - `POST /api/categories`: Tạo thể loại mới.
  - `PUT /api/categories/{id}`: Cập nhật thông tin thể loại.
    - Payload: `{ name: string, description: string }`

### 2.4. Database Schema Updates
Sử dụng các bảng `comics`, `chapters`, và **`categories`** hiện có. 
- Bảng `categories` được bổ sung cột `description` (TEXT) để lưu nội dung SEO.
- Ứng dụng sử dụng SQLAlchemy matching chính xác schema DB.

## 3. Frontend Specifications (`cms/fe`)

### 3.1. Core Tech
- React 18+ (Vite)
- Routing: React Router v6
- Styling: Tailwind CSS
- State Management / Fetching: React Query (@tanstack/react-query) & Axios
- UI Components: Khuyến nghị xài Radix UI + Tailwind (như shadcn/ui) hoặc headless UI để lên màu Xanh Biển/Đen/Trắng nhanh.

### 3.2. Page Structure
1. **/login**: Trang đăng nhập duy nhất cho Admin.
2. **/ (Dashboard)**: Thống kê nhanh và điều hướng.
3. **/comics**: Quản lý Truyện.
   - Bảng danh sách với cột Title, Status.
   - Nút "Edit (SEO)" -> Link tới `/seo-edit/comic/{slug}`.
4. **/comics/{id}/chapters**: Quản lý Chapters.
   - Bảng danh sách chapters, cột Publish Status.
   - Nút "Edit (SEO)" -> Link tới `/seo-edit/chapter/{id}`.
5. **/categories**: Quản lý Thể loại.
   - Bảng danh sách slug, tên thể loại.
   - Chức năng "Thêm Thể loại" để tạo slug mới cho SEO.
   - Nút "Edit (SEO)" -> Link tới `/seo-edit/category/{id}`.
6. **/seo-edit/{type}/{id}**: Trang chỉnh sửa SEO tập trung.
   - Thay thế cho Modal cũ để xử lý nội dung văn bản dài (>1000 từ).
   - Tích hợp **Unsaved Changes Guard** (cảnh báo khi thoát trang mà chưa lưu).

### 3.3. UI / UX Design System
- Header: Sticky header màu `Xanh biển` (#0ea5e9 hoặc tương đương).
- Sidebar: Đen (#1e293b) chữ trắng, gọn gàng.
- Nền trang chủ: Màu xám nhạt/trắng (#f8fafc) để nổi form dữ liệu.
- Nút bấm (Button): Primary color là Xanh biển, trạng thái nguy hiểm (Màu đỏ/cam).

## 4. OPS / Deployment Specifications

### 4.1. Directory Structure
```
cms/
└── api/
    ├── Dockerfile
    ├── requirements.txt
    └── app/
└── fe/
    ├── Dockerfile
    ├── package.json
    └── src/
```

### 4.2. Docker Compose Setup (`ops/docker/docker-compose.yml`)
- Yêu cầu setting `network_mode: "host"` để API dễ dàng gõ thẳng vào Postgres DB (ví dụ localhost:5432).
- Ví dụ service cấu hình trong `ops/docker/docker-compose.yml`:
```yaml
  cms-api:
    build:
      context: ../../cms/api
      dockerfile: Dockerfile
    container_name: commics-cms-api
    network_mode: "host"
    environment:
      - DATABASE_URL=postgresql+asyncpg://commics:secret@127.0.0.1:5433/commics
      - ADMIN_USER=admin
      - ADMIN_PASS=admin
      - JWT_SECRET=super_secret_key
    profiles: [ "services" ]
    restart: always

  cms-fe:
    build:
      context: ../../cms/fe
      dockerfile: Dockerfile
    container_name: commics-cms-fe
    network_mode: "host"
    environment:
      - VITE_API_URL=http://localhost:8000/api
    profiles: [ "services" ]
    restart: always
```
*(Cổng API mặc định FastAPI: 8000, FE chạy preview ở port 5173)*

## 5. Implementation Plan (Tiếp theo)
1. Xây dựng cấu trúc Backend FastAPI & kết nối DB.
2. Định nghĩa SQLAlchemy models matching bảng `comics`, `chapters`.
3. Viết Endpoints API (Comics & Chapters) lấy và tự lưu title/description cũ.
4. Xây dựng Frontend UI khung Admin.
5. Thiết kế form update UI với SEO box.
6. Setup Docker, Docker Compose network_mode host.
7. QA / QC.
