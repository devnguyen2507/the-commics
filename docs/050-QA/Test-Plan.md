# Kế hoạch Kiểm Thử (Test Plan) Chi Tiết Từng Đặc Tả (Spec)

**Dự án**: Commics
**Phiên bản**: 1.0.0
**Ngày lập**: 2026-03-01
**Mục tiêu**: Hướng dẫn đội ngũ QA các TestCase (TC) cụ thể để pass được "Biên bản nghiệm thu" (Acceptance Criteria), đảm bảo 5 Spec hoạt động bảo mật, không crash, và không nghẽn cổ chai.

---

## 1. Domain: Crawler Engine (Spec-002)

| Test Case ID | Mục tiêu Kiểm thử (Objective) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Mức độ |
| -- | -- | -- | -- | -- |
| **TC-CRAWL-01** | Test chiến lược Bypass bằng SOCKS Proxy & UA | 1. Tắt proxy cấu hình trong file Crawler.<br>2. Chạy Crawler cào 1.000 request liên tục.<br>3. Bật Proxy và retry. | Bị block HTTP 403/503 ở bước 1. Hoạt động trơn tru > 95% sau bước 3. | Critical |
| **TC-CRAWL-02** | Test Logic Chống Trùng (Upsert ON CONFLICT) | 1. Lấy ID 1 truyện đã crawl thành công.<br>2. Delete bằng tay 1 list ảnh ở Database.<br>3. Gửi lại Input để Crawler cào lại đúng URL đó. | Array Chapters không bị phình dài ra gấp đôi. Data ảnh thiếu tự bù lấp. | Critical |
| **TC-CRAWL-03** | Test Path Immutable (Không xài Slug) | 1. Web nguồn HentaiVN vừa đổi slug truyện A thành B.<br>2. Chạy cào lại truyện. | Path lưu ảnh trên Disk VẪN LÀ UUID/ID số định danh, KHÔNG tự đẻ ra folder mới dựa theo slug B. | High |
| **TC-CRAWL-04** | Test Thuật toán xếp thứ tự (Order Index) | 1. Đưa đầu vào input array mảng lộn xộn: "Chap 1, Oneshot, Chap 2.1".<br>2. Chạy parser. | DB gán Float `order_index` chuẩn xác: Oneshot(1.0) -> Chap 1(1.1 hoặc 2.0) -> Chap 2.1(3.0). | High |

---

## 2. Domain: Database Layer (Spec-003)

| Test Case ID | Mục tiêu Kiểm thử (Objective) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Mức độ |
| -- | -- | -- | -- | -- |
| **TC-DB-01** | Test Atomic DB Lock (Transaction) | 1. Viết 1 script mô phỏng Inject insert array Chapter.<br>2. Ở code Backend Rust, chèn dòng `panic!()` cố tình kill app giữa chừng sau khi insert Chapter nhưng chưa update Worker Status. | Row Chapter rác bị rớt Rollback sạch sẽ. Status Worker vẫn y nguyên Pending. | Critical |
| **TC-DB-02** | Test Unique Constraints | 1. Dùng PgAdmin/DBeaver INSERT thủ công 2 dòng bảng Chapter có cùng `comic_id` và `chapter_number`. | Postgres chặn đứng, quăng lõi `Unique Violation Error`. | Critical |
| **TC-DB-03** | Test cấu trúc JSONB Dimensions | 1. Kéo 1 chapter từ Temporal chạy thẳng xuống DB.<br>2. SELECT cột `images`. | Array phải có shape: `[{"file":"..", "w": Int, "h": Int}]`. | High |

---

## 3. Domain: CDN imgflux (Spec-005)

| Test Case ID | Mục tiêu Kiểm thử (Objective) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Mức độ |
| -- | -- | -- | -- | -- |
| **TC-CDN-01** | Test Thundering Herd Atomic Lock | 1. Xóa cache ảnh `A.jpg` trên Disk.<br>2. Dùng Apache Bench `ab -n 50 -c 50 /cdn/A.jpg`. | Chỉ có DUY NHẤT 1 instance của `Lanczos3` xuất hiện ở Monitor CPU. 50 Requests kia trả về file RAW siêu lẹ. | Critical |
| **TC-CDN-02** | Test Header Progressive Fallback | 1. Dùng Curl request hình mới lần 1.<br>2. Request hình đó lần 2 sau 5s. | Lần 1 Header: `Cache-Control: no-cache`. Thể tích file lớn. <br>Lần 2 Header: `Cache-Control: public, immutable`. Kích thước nhỏ (Webp). | High |
| **TC-CDN-03** | Test Chống Lặp Nén File Hỏng | 1. Tạo file fake `broken.jpg` (0 byte).<br>2. Gửi request kéo `broken.jpg` qua CDN. | Request bị reject báo file Raw hỏng, CDN dán nhãn `uncompressible` KHÔNG bao giờ thử nén lại vào lần sau. | Medium |
| **TC-CDN-04** | Test Render Borders (Chống Artifact) | 1. Lấy 2 ảnh truyện dài Webtoon nén qua tham số url `&mode=reader`.<br>2. Nối thử bằng flex-box CSS trên Browser. | Viền khít ôm trọn 100%, không xuất hiện vạch trắng dính nhau. | High |

---

## 4. Domain: GraphQL API Layer (Spec-004)

| Test Case ID | Mục tiêu Kiểm thử (Objective) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Mức độ |
| -- | -- | -- | -- | -- |
| **TC-GQL-01** | Test LRU Cache Memory Leak | 1. Dùng tool `K6` bắn Loop GraphQL query list Categories ngẫu nhiên liên tục 1.000.000 vòng.<br>2. Check `htop` RAM server. | Bộ nhớ của process Rust dừng phình to ở ngưỡng Capacity khai báo (VD: 50MB, max item = 5000), tống item cũ đi tự động. | Critical |
| **TC-GQL-02** | Test Nguy cơ N+1 (Dataloader) | 1. Fetch `ListComics` lấy 50 truyện. Ở trong body yêu cầu trả về list list `Tags`.<br>2. Nhìn Console Log Database của app. | Chỉ in ra đúng 2 dòng SQL: `SELECT * FROM comics LIMIT 50` và `SELECT * FROM tags WHERE comic_id IN (1,2,..,50)`. | Critical |
| **TC-GQL-03** | Test Diesel Schema Sync | 1. Cố ý viết sai kiểu dữ liệu bên trong Frontend GraphQL Query.<br>2. Khởi chạy thử Query. | Rust App từ chối nhận API vì Rust struct được sinh cứng từ Diesel Schema (Type Safety Validation) không match. | High |
| **TC-GQL-04** | Test Cursor-based Pagination | 1. Kéo API 50 truyện với tham số `after: "ID123"`. | Thời gian response < 50ms cho số lượng mảng dữ liệu > 2 Triệu records. Đánh bại query Offset cũ. | High |

---

## 5. Domain: Frontend Astro & SEO (Spec-006)

| Test Case ID | Mục tiêu Kiểm thử (Objective) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Mức độ |
| -- | -- | -- | -- | -- |
| **TC-FE-01** | Test Eviction chống Quota Limit | 1. Setup LocalStorage lưu 499 Truyện History.<br>2. Mở đọc 20 Truyện mới nhanh nhất có thể. | `LocalStorage.length` không vượt quá 500. Các số liệu cũ nhất bị xoá đi. Trình duyệt không có Alert Exception đỏ. | Critical |
| **TC-FE-02** | Test CLS = 0 (Cumulative Layout Shift) | 1. Kéo mạng Chrome Dev về chế độ "Slow 3G".<br>2. Vào 1 đọc chapter có 50 ảnh dọc. | Các ô HTML `<div>` bọc ảnh đã dựng sẵn diện tích x,y (dựa theo Dimensions API đẩy về). Scroll tít xuống đáy rồi Scroll ngược lên, thanh cuộn không bị "run" mất kiểm soát lúc load ảnh vô. | High |
| **TC-FE-03** | Test Head Metadata SEO tĩnh | 1. Tắt tuỳ chọn "Cho phép Chạy Javascript" trong Viewport Chrome.<br>2. F5 refresh trang Chi tiết. | Data quan trọng như H1 title, Description, Bìa ảnh `alt="Tên"` VẪN hiển thị đầy đủ HTML thô, ko bị biến thành loading icon. | Critical |
| **TC-FE-04** | Test Stateless Analytics | 1. Đăng nhập User, nhấn "Bookmark" Truyện A.<br>2. Mở Tab Network Inspect. | Khong có bất kỳ HTTP POST Request nào chạy xuống Backend GraphQL. State lưu triệt để bằng IndexedDB. | High |
