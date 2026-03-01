---
id: Spec-005
type: technical-spec
status: draft
project: commics
owner: "DevNguyen"
tags: [cdn, imgflux, edge, image-optimization]
created: 2026-03-01
updated: 2026-03-01
linked-to: [[020-Requirements/PRD-CDN]]
---

# Spec: Hệ thống CDN & Optimization (imgflux)

Tài liệu này chi tiết hóa kiến trúc hoạt động của hệ thống `imgflux` CDN, với trọng trách tối ưu hóa độ nặng file media và phân phối dữ liệu truyện tốc độ cao xuyên việt.

## 1. Hiện trạng & Yêu cầu (Current State & Requirements)

Hệ thống xử lý lượng lớn Traffic về hình ảnh, do bộ crawler tải file nguồn ở dạng ảnh RAW siêu nặng từ web gốc.

| Phân hệ             | Yêu cầu thu thập                                       | Trạng thái  | Ghi chú                                   |
| :------------------ | :----------------------------------------------------- | :---------- | :---------------------------------------- |
| **Format Conversion**| Đổi đuôi JPG/PNG -> WebP/Avif                         | ⚠️ Pending   | Tiết kiệm 40% bandwidth                   |
| **Dynamic Resizing**| Shrink Thumbnails theo tham số URL (VD: `w=300`)       | ⚠️ Pending   | Tránh load raw image bự tại Home Page     |
| **Edge Caching**    | Lưu Cache Object trên RAM/SSD cho hit kế tiếp          | ⚠️ Pending   | Tránh convert lại                         |

### 1.2. Khoảng trống dữ liệu nhận diện từ Khảo sát
Dựa theo `Design-Prototype.md`:
- Hệ giao diện đòi hỏi các Block Thumbnails sinh ra phải Fit chuẩn tỷ lệ vàng **2:3**.
- Render vùng biên (Border Gap) của hình ảnh đọc Webtoon (Cuộn dọc liền mạch) bắt buộc không được để sót 1 pixel viền trắng hoặc răng cưa do thuật toán nén sai.

---

## 2. Giải pháp Kỹ thuật (Proposed Solution)

### 2.1. Tự động hóa Pipeline ảnh (On-The-Fly Processing)

Sử dụng thư viện Image encoding gốc bằng **Rust** (module `imgflux`) để làm Layer Server Middleware giữa Storage (Disk) và HTTP Response.

1. **Request Flow**: 
   - Khách request. `imgflux` bắt URL. Tra cứu Local Cache. Nều HIT, xả file WebP stream (header allow edge cache). 
   - Nếu MISS (Lần tải đầu do Crawler mới kéo về), service áp dụng **Atomic File Lock (Chống Thundering Herd)**: Request thứ 1 báo is_processing tải stream bản RAW gốc mảng bytes cấp về HTTP lập tức (kèm header No-cache để Cloudflare khỏi nhớ). Các request số 2,3 vào thấy lock cũng tự xả RAW Stream về mà ko gọi hàm nén phụ. Ngầm ở dưới bắn worker thread chạy nén.
2. **Xử lý Transform & Validate (Worker Stream)**:
   - File Corruption Check: Trước khi nén phải đọc Magic Byte Header ảnh. Nếu header nát -> Set flag vĩnh viễn không nén để tránh infinite loop CPU crash.
   - Resizer: Dùng Filter Algorithm `Lanczos3` (Chậm nhưng chất lượng tốt nhất) để ép tỷ lệ Crop về `2:3` theo thiết kế Design system yêu cầu cho Thumbnail.
   - Hạn chế Image Quality ở mức `80-85` qua WebP encoder. Mức này bằng mắt thường Reader không phân biệt được so với Raw nhưng File size giảm sốc 60%. Lệnh thành công xóa File Lock.

### 2.2. Phân vùng Bộ đệm (Disk Caching Strategy)

Hệ thống lưu trữ bản sao của từng kích thước ngay tại thư mục Nginx Cache hoặc bộ đệm của imgflux.
- **LRU Cache Cleanup**: Xóa tệp cũ ít view nhất (least recently used) khi dung lượng disk đạt quota (Ví dụ: 80% Disk Capacity).

## 3. Phân tích Kiến trúc Component (DevNguyen's Insight)

Một vấn đề kỹ thuật lớn là: **Gap Artifacts (Răng cưa gãy viền đen) trong truyện Webtoon**.

### 3.1. Vấn đề Webtoon Rendering
Trong chế độ đọc cuộn dọc dài, các trang ảnh ghép chồng lên mép nhau. Bất kỳ thuật toán nén ảnh hay Resize nào có dính logic "Anti-Aliasing Edge" hoặc thêm Pixel padding trắng sẽ làm đứt mạch nguyên khối của truyện, vạch kẻ ngang.

### 3.2. Chế ước Reader Original Aspect
Hệ thống `imgflux` khi nhận API trích xuất ảnh **Reader Mode** phải có tham số `&mode=reader` bypass triệt để thuật toán resize/crop. Chỉ độc nhất một filter được phép chạy đó là Convert Format (Raw -> WebP compression). Giữ **Original Dimensions** 100%.

> [!TIP]
> **Kết luận**: Phân tách URL Parameters xử lý ảnh làm CẤP ĐỘ RÕ RÀNG: `Thumbnails/Cover` được phép cắt gọt tự do, còn `Reader Images` được bảo tồn nguyên trạng chiều rộng và mép viền, phục vụ trải nghiệm cuộn liền mạch.

---

## 4. Kiến nghị triển khai

- **Công cụ**: Build module Rust `imgflux` thành nhị phân (binary server), chặn các external access vào port trực tiếp mà thông qua Reverse Proxy (Nginx / Caddy) quản SSL và DDoS.
- **Fallback URL**: Nếu ảnh bị mẻ mốc lỗi tại storage server, CDN tự động Response file hình ảnh Default (Placeholder) tỷ lệ 2:3 với status 404/200 OK tuỳ thiết lập JS.
- **Header Controls**: Sinh kèm `Cache-Control: public, max-age=31536000, immutable` cho phép Browser của Client giữ luôn ảnh dưới Local, chối từ I/O network truy vấn lại.

## Tham chiếu
- [[020-Requirements/PRD-CDN]]
