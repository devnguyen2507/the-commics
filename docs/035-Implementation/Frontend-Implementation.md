# Kế Hoạch Triển Khai Thực Tế: Frontend (Astro)

Tài liệu này ghi nhận kế hoạch triển khai frontend thực tế dựa trên Spec đã lập trước đó, làm rõ kiến trúc luồng dữ liệu, cách map UI và chuẩn hoá CDN.

## 1. Kiến Trúc Luồng Dữ Liệu: Lib -> Adapter -> View

Để đảm bảo tính nhất quán (Consistency) của dữ liệu từ GraphQL API đến Giao diện (Astro Components), dự án sử dụng mô hình Adapter Pattern.
Thay vì truyền thẳng response GraphQL vào Component, mọi dữ liệu đều phải qua Adapter để chuẩn hoá (`mapToView`).

### 1.1 Thư viện kết nối (Lib)
- **File**: `src/lib/api/commics/client.ts`
- **Mục đích**: Chịu trách nhiệm fetch dữ liệu thuần (Raw GraphQL response) qua hàm `GQLFetch`.
- **Yêu cầu an toàn**: GQLFetch phải làm sạch các biến (remove `undefined` keys) để tránh lỗi deserialize từ backend Rust.

### 1.2 Lớp chuyển đổi (Adapter)
- **File**: `src/lib/api/commics/adapters/comic.ts`
- **Mục đích**: Nhận Raw Data và trả về cấu trúc View Model (`ComicView`, `ChapterView`...).
- **Xử lý ngầm**:
  - Xử lý mảng rỗng `[]` hay null fallback mặc định.
  - Định dạng lại hình thức URL (Ví dụ: `slug` -> URL path).
  - Mapping ảnh gốc sang Local CDN URL thông qua hàm `getImageUrl()`.

### 1.3 Lớp Hiển Thị (View / Components)
- **Thư mục**: `src/pages/`, `src/components/ui/`
- **Mục đích**: UI Component nhận View Model thuần túy, tuyệt đối không biết về logic GraphQL hay cấu trúc mảng lồng nhau phức tạp.
- Ví dụ: `<ComicCard comic={comicView} />`

---

## 2. Quản Lý Router & Component Tái Sử Dụng

### 2.1 Các Route Chính
- `/`: Homepage - Chứa HeroSlider và lưới truyện Mới Cập Nhật. Dùng `<ComicCard>`.
- `/truyen-hot`: Danh sách truyện xem nhiều (`sort: MOST_VIEWED`).
- `/tim-kiem?q=keyword`: Trang kết quả tìm kiếm. Đồng nhất lưới truyện như trang chủ. Lọc theo biến query `searchQuery`.
- `/{slug}`: Chi tiết truyện. Hiển thị Chapter List, Nội dung Description.
- `/{slug}/{chapterId}`: Trang đọc truyện (Reader). Chứa logic cuộn ảnh mượt mà và pre-fetch.
- `/the-loai` và `/the-loai/{slug}`: Taxonomy phân loại truyện.

### 2.2 Chuẩn Giao Diện (UI/UX)
- Sử dụng lưới (Grid CSS) responsive từ Mobile (2 cột) lên Layout Desktop (6 cột) thông qua Tailwind classes (`grid-cols-2 md:grid-cols-4 lg:grid-cols-6`).
- Các thẻ truyện (Comic Card) phải giới hạn dòng hiển thị (Line clamp) để tiêu đề không phá layout.
- "Empty States": Bắt buộc có dòng chữ thông báo trống khi mảng API trả về rỗng (VD Tìm kiếm không có kết quả).

---

## 3. Quản Lý Ảnh & Tích hợp CDN (Backend - Frontend Sync)

- **Ảnh Bìa (Cover Image)**: Từ GraphQL, `coverImage` trả về path thô. Ở Frontend, Adapter phải bọc qua helper `getImageUrl(path)` để nối chuỗi tiền tố CDN cục bộ (VD: `/cdn-cgi/image/original/`).
- **Ảnh Chương (Reader Images)**: Backend GQL resolver (`images` list trong `Chapter`) trích xuất `storage_path` bằng cách join bản DB `assets`. Frontend map cái `storage_path` đó qua `getImageUrl(path)` để browser gọi lên container CDN.
- **Biến Môi Trường**: `PUBLIC_CDN_URL` chỉ dẫn URL thực tế của hệ thống CDN.

---

## 4. Dockerization & Decoupling

Khởi chạy độc lập UI với quy trình Dockerization nhiều giai đoạn (Multi-stage build):
1. **Build Stage**: Cài npm packages và chạy `npm run build` để xuất file tĩnh/bản build server.
2. **Runner Stage**: Copy `dist/` và `node_modules` chạy bằng command `node ./dist/server/entry.mjs`.

**Tính Độc Lập Mạng (Decoupling)**:
- Container UI không phụ thuộc (`depends_on`) cứng vào `graphql` và `cdn`.
- Truy xuất mạng từ UI docker container ra GraphQL và CDN bằng URL đối mặt với Host: `http://host.docker.internal:...` giả lập việc gọi từ 1 domain công cộng vào cụm dịch vụ ẩn bên trong.

---

## 5. Check List SEO Cơ Bản (Đã Khởi Đầu)
- Áp dụng file `Layout.astro` chuẩn cho toàn trang.
- Đang có hỗ trợ meta tags cơ bản (`description`, `title`).
- *(Lưu ý: Yêu cầu mở rộng tiếp QA SEO như thiết lập Robot, Sitemap, chuẩn hoá H1/H2, và JSON-LD)*.
