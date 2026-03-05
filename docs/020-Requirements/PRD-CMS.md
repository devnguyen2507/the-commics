# Product Requirements Document (PRD): SEO & Content Management System (CMS)

## 1. Overview
Mục tiêu là xây dựng một hệ thống CMS nội bộ đơn giản, dùng để quản lý trạng thái xuất bản (publish/unpublish) của Truyện (Comics) và Chương (Chapters), đồng thời quản lý các trường nội dung phục vụ cho SEO.

## 2. Tech Stack
- **Role:** 1 vai trò duy nhất (Admin), 1 account duy nhất.
- **Backend (`cms/api`)**: Python + FastAPI (Nhanh, dễ setup, tự động sinh docs OpenAPI).
- **Frontend (`cms/fe`)**: React + Vite + TailwindCSS (Dễ chỉnh sửa, hiệu năng tốt, có nhiều template dashboard admin có sẵn).
- **Giao diện (UI)**: Dạng Admin Dashboard dễ dùng, ít confirm rườm rà. Tông màu chủ đạo: Xanh biển, Trắng, Đen.
- **Nền tảng**: Web (Không cần Mobile).
- **Ops / Deployment**: Cài đặt Docker service cho CMS (API & FE) sử dụng `network_mode: host`.

## 3. Phân tích Database & Cấu trúc SEO
Lưu ý quan trọng: CMS chỉ thực hiện CRUD trên schema DB đã có sẵn, KHÔNG TẠO MIGRATION MỚI.
Phân tích source code Frontend hiện tại đã cho thấy:
- Trang chi tiết truyện (`[slug].astro`) dùng trường `comic.title` và `comic.description` làm Meta Title và Meta Description.
- Trang chi tiết chương (`chap-[chapterNum].astro`) dùng trường `comic.title`, `chapter.chapterNumber` để build Meta Title, và dùng `chapter.description` làm Meta Description. Đồng thời thông tin này hiển thị ở thẻ "SEO Content Box" dưới cùng của chương.

Do đó, các trường phục vụ ở UI CMS sẽ tương ứng:

### Đối với Truyện (Comics)
- `title`: Sẽ đóng vai trò làm Tiêu đề Truyện + Meta Title SEO.
- `description`: Sẽ đóng vai trò làm Nội dung + Meta Description SEO.
- `is_publish`: Bật/tắt Truyện.

### Đối với Chương (Chapters)
- `description`: Sẽ đóng vai trò làm Nội dung + Meta Description SEO cũng như nội dung `SEO Content Box` trong trang đọc chap.
- `is_publish`: Bật/tắt Chương.

## 4. Scope: Giai đoạn 1 (Những tính năng cần ngay)

Để có thể vào sửa liền thông tin cần thiết:

### 4.1. Quản lý Truyện (Comics)
- Hỗ trợ xem danh sách truyện.
- Có nút Toggle switch (On/Off) để Bật / Tắt `is_publish` của Truyện nhanh.
- Form "Edit Truyện" chứa phần:
  - **Thông tin truyện & SEO Box**: Nhập/Sửa `title` (Tên truyện + SEO Title), `description` (Mô tả truyện + SEO Description).

### 4.2. Quản lý Chương (Chapters)
- Từ giao diện quản lý truyện, click vào để vào trang chi tiết các chương.
- Có nút Toggle switch (On/Off) để Bật / Tắt `is_publish` của Chương nhanh.
- Form "Edit Chương" chứa phần:
  - **SEO Box**: Nhập/Sửa `description` riêng cho chapter (sẽ update trực tiếp vào trường `description` của bảng chapters).

## 5. Cấu trúc thư mục (Folder Structure)
```
cms/
├── api/                  # Python FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   ├── core/             # config, security, auth
│   ├── models/           # SQLAlchemy / Database models (kết nối trực tiếp vào DB PostgreSQL của Rust)
│   ├── routers/          # API endpoints (comics, chapters)
│   └── schemas/          # Pydantic schemas cho trả về
└── fe/                   # React + UI Vite
    ├── index.html
    ├── package.json
    ├── src/
    │   ├── components/   # UI components (SEO Box, Toggle, Button)
    │   ├── layouts/      # Admin Layout (Sidebar, Header xanh biển, trắng, đen)
    │   ├── pages/        # Dashboard, ComicsList, ChapterList
    │   ├── services/     # API Call config (Axios)
    │   └── utils/
    └── tailwind.config.js
```

## 6. QA/QC Checklist (Sơ bộ)
- [ ] Truy xuất API danh sách Comics từ DB hiển thị thành công trên FE.
- [ ] Test thao tác 1-click Toggle Publish/Unpublish (Comics) lưu vào DB.
- [ ] Test update nội dung form (kể cả SEO box của Comics).
- [ ] Truy cập danh sách Chapters của 1 Comic.
- [ ] Test thao tác 1-click Toggle Publish/Unpublish (Chapters).
- [ ] Test update nội dung form (kể cả SEO box của Chapter).
- [ ] Đăng nhập bảo mật 1 Account duy nhất thành công (Token JWT).
- [ ] Giao diện (Màu Xanh biển, Trắng, Đen) mượt mà, dễ nhìn.
