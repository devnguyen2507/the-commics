---
id: Spec-002
type: technical-spec
status: approved
project: commics
owner: "DevNguyen"
tags: [crawler, temporal, python, hentaivn]
created: 2026-03-01
updated: 2026-03-01
linked-to: [[020-Requirements/PRD-Database]]
---

# Spec: Hệ thống Crawler & Scraper bằng Temporal

Tài liệu này chi tiết hóa kiến trúc và luồng xử lý của hệ thống thu thập dữ liệu tự động (Crawler), điều phối bởi Temporal để đảm bảo độ chính xác và khả năng tự phục hồi.

## 1. Hiện trạng & Yêu cầu (Current State & Requirements)

### 1.1. Luồng chạy độc lập
Hệ thống Crawler chịu trách nhiệm thu thập tự động và chính xác dữ liệu truyện (Comics) từ các nguồn mục tiêu, bắt đầu với `hentaivn.ch`.
- **Mục tiêu chính**: `https://hentaivn.ch/`
- **Nguyên lý gốc**: Thu thập nguyên bản, không chỉnh sửa ảnh thô. Lưu trữ theo định dạng chuẩn hóa.

| Phân hệ             | Yêu cầu thu thập                                       | Trạng thái  | Ghi chú                                   |
| :------------------ | :----------------------------------------------------- | :---------- | :---------------------------------------- |
| **Comic Metadata**  | Tiêu đề, Tác giả, Description, Status                  | ⚠️ Pending   | Cập nhật theo `comic-id`                  |
| **Categories**      | 10 danh mục ưu tiên (NTR, Webtoon, Gia đình...)        | ⚠️ Pending   | Parse từ HTML tags                        |
| **Media Assets**    | Logo, Banner, Thumbnail                                | ⚠️ Pending   |                                           |
| **Chapter List**    | Danh sách chương (Order Index, String ID)              | ⚠️ Pending   | Đảm bảo đúng thứ tự                       |
| **Chapter Content** | Links hình ảnh trong nội dung truyện                   | ⚠️ Pending   | Scan thứ tự các thẻ `<img>`               |

### 1.2. Khoảng trống dữ liệu nhận diện từ Survey
Dựa vào phân tích từ `Deep-Survey-Data.md`:
- **Định dạng thẻ `<a>` thay đổi**: Các URL của truyện trên slider và trang chủ có cấu trúc linh hoạt (VD: `/30000-doc-truyen-` vs `/truyen/`). Cần fallback regex.
- **Oneshots vs Long-story**: Thiếu tính năng định danh số chương rõ ràng cho Oneshots trên giao diện.

---

## 2. Giải pháp Kỹ thuật (Proposed Solution)

Dựa trên đề xuất kiến trúc sử dụng **Temporal Workflow**, chúng ta triển khai hệ thống thu thập bền bỉ có khả năng chịu lỗi (fault-tolerant).

### 2.1. Temporal Workflows & Activities

**Workflow 1: Comic Listing & Metadata**
- **Input**: Có thể truyền `source_url` (Web gốc) hoặc `source_id` (Website numeric ID) nếu **Truyện chưa có trong Server DB**, hoặc truyền `comic_id` nếu truyện đã tồn tại cần quét lại metadata.
- **Nhiệm vụ**: Điều phối các Activities tải trang HTML, phân tích (parse) DOM bằng beautifulsoup/playwright để nhổ thông tin Tiêu đề, Tags.
- **Logic Xử lý Dữ Liệu Lần Đầu (Mới Cào)**:
  - Nếu input là `source_url` mới cào, hệ thống sẽ thực thi Upsert vào PostgreSQL (Insert tạo ID mới, đổi trạng thái) -> Từ đó đẻ ra `internal_comic_id` của chính DB mình.
  - Sử dụng `internal_comic_id` này làm parameter mồi cho các Activity tạo Thư mục Disk `storage_path` bất biến.
- **Logic Đặc thù**: 
  - **Logic Bóc tách (Parsing Strategy)**: Lấy HTML source nguyên bản về (raw source). Phân tích DOM Tree kết hợp với biểu thức Regex tĩnh.
  - Nếu title hoặc content HTML chứa chữ `oneshot`, tự động gán dữ liệu `chapter_number = "1"`.
  - Push danh sách các chapter lấy được kèm `internal_comic_id` vào Message Queue hoặc Database để Workflow 2 xử lý.

**Workflow 2: Chapter Details & Assets**
- **Input**: `comic-id`, `chapter_id`.
- **Nhiệm vụ**: 
  - Điều phối Activity vào trong trang chi tiết chương.
  - Lấy sạch danh sách các tag `<img>`.
  - Điều phối Activity tải từng ảnh về và lưu vào Disk theo định dạng path.
  - **Data Duplication (Upsert)**: Khi ghi danh sách chương vào DB, bắt buộc dùng lệnh **Upsert** (`ON CONFLICT DO UPDATE`) để tránh sinh rác chapter bị trùng khi Crawler chạy lại.

### 2.2. Chiến lược Tải và Lưu trữ Hình ảnh

Giải pháp này trích xuất ảnh nguyên bản (raw) về Local Storage để phục vụ CDN.

#### Schema Lưu trữ:
- **Path Storage**: Bắt buộc là Immutable Path `storage/commics/{comic-id}/chapter/{chapter-id}/<thu-tu>.<format ảnh>`. Tuyệt đối **không được dùng `slug`** làm thư mục vì slug có thể thay đổi ở web nguồn làm gãy toàn bộ đường dẫn CDN sau này.

#### Logic Tải Ảnh (Bypass Anti-Bot)
Hàm thực thi tải hình ảnh (ví dụ: `download_img`) **bắt buộc** phải trang bị cơ chế giả lập danh tính người thật để không bị block:
- **Chuẩn hóa Headers**: Đưa vào đầy đủ `User-Agent` của trình duyệt phổ biến, `Accept`, `Accept-Language`.
- **Đính kèm Referer**: Phải truyền Header `Referer` (hoặc `Origin`) trỏ chính xác về domain gốc (Ví dụ: `https://hentaivn.ch/` hoặc chính URL của trang đọc truyện) để vượt qua các lớp bảo vệ chống Hotlink gây lỗi 403 Forbidden.

#### Tại sao cần lưu trực tiếp?
1. **Chủ quyền Dữ liệu**: Tránh rủi ro website gốc thay đổi URL ảnh hoặc chặn IP server.
2. **Cung cấp cho CDN**: `imgflux` CDN cần có file vật lý gốc trên server mồi để thực hiện quy trình Dynamic Resizing & Convert Format Webp phục vụ Frontend.

## 3. Phân tích Kiến trúc Component (DevNguyen's Insight)

Một vấn đề kỹ thuật lớn là: **Định danh Chapter như thế nào để vừa linh hoạt vừa dễ sắp xếp (Order)?**

### 3.1. Vấn đề của Number/Float
Web truyện thường xuất hiện những format khó lường: `Chap 1`, `Chương 02`, `10.5` hoặc chữ `Oneshot`. Việc ép nó thành kiểu Integer hay Float trên Database là tự hủy khi phục vụ UI (mất khả năng format text).

### 3.2. Giải pháp Dual-Identifier (String + Index)
Để tối ưu, hệ thống Crawler buộc phải bóc tách 2 trường thông tin gửi vào Database:
1. **`chapter_number` (STRING)**: Lưu DỮ LIỆU THÔ để display trên UI. Vd: "Oneshot", "02".
2. **`order_index` (INTEGER/FLOAT)**: Cần có một thuật toán (Activity riêng trong Temporal) đánh số thứ tự tuyệt đối từ nhỏ đến lớn dựa vào vị trí nó được liệt kê trên danh sách gốc. GraphQL sẽ `.orderBy(order_index)`.

> [!TIP]
> **Kết luận**: Việc uỷ quyền hoàn toàn quá trình "sắp xếp logic" cho Crawler (tính sẵn lúc thu thập thay vì bắt API layer tự sort realtime) sẽ giảm tải cực lớn cho Database, giúp GraphQL API response cực nhanh.

---

## 4. Kiến nghị triển khai

- **Công cụ**: Sử dụng Python SDK của Temporal. Lớp cào dữ liệu xài `aiohttp` để đạt hiệu năng song song khi tải ảnh.
- **Retry Policy**: Lập lịch Temporal Exponential Backoff (VD: thử lại sau 10s, 30s, đụng timeout IP thì pause queue).
- **Fallback Regex**: Bắt Regex cực mạnh tại Workflow 1 để xử lý trọn vẹn mọi định dạng routing (slider vs list) từ trang HeitaiVN.

## Tham chiếu
- [[040-Design/Deep-Survey-Data]]
- [[020-Requirements/PRD-Database]]
