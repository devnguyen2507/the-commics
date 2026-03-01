# Biên Bản Nghiệm Thu Kỹ Thuật (Acceptance Criteria)

**Dự án**: Commics
**Thời gian lập**: 2026-03-01
**Mục tiêu**: Bảng checklist này là tiêu chuẩn Vàng (Gold Standard) bắt buộc các Dev/Agent phải pass khi bàn giao module Code thực tế.

## 0. Domain: Trọng điểm Chất lượng Code (Engineering Standards)
*Lưu ý: Các module bắt buộc phải qua ải này trước khi Build Docker chuyển giao.*

| ID | Tiêu chí Nghiệm thu (Acceptance Criteria) | Phương pháp Xác thực (Verification) |
| --- | --- | --- |
| CODE-01 | **Clean Architecture & Naming** | Mở source code bất kỳ. Tên biến, class, hàm phải đọc như tiếng Anh tự nhiên. Tất cả Functions béo (Fat function) phải được bẻ nhỏ (1 function - 1 task). |
| CODE-02 | **Linter & Formatter Clean** | Tại Terminal chạy linter: <br>- Đối với Rust: `cargo clippy -- -D warnings` và `cargo fmt --check`<br>- JS/TS: `npm run lint` & `tsc --noEmit`<br>- Python: `ruff check .` -> Output trả về 0 Errors/Warnings. |
| CODE-03 | **Unit Testing Coverage** | Dev bắt buộc đính kèm File Test (Mock testing). Chạy command Test (VD: `cargo test` / `pytest`) trả về toàn bộ mảng `Passed`. Không skip test! |
| CODE-04 | **Component Reusability** | Code logic lặp lại > 2 lần phải được tống vào thư mục `libs/utils` đối với Backend hoặc cấu trúc `<Component />` đối với UI Astro để xài chung. |

---

## 1. Domain: Crawler Engine (Python Temporal)
| ID | Tiêu chí Nghiệm thu (Acceptance Criteria) | Phương pháp Xác thực (Verification) |
| --- | --- | --- |
| CR-01 | **Bypass Anti-bot Rate**: Không bị ban IP khi cào hàng ngàn trang liên tục. | Chạy bot liên tục 1 giờ. Xác thực HTTP 200 > 95%. |
| CR-02 | **Upsert Duplication**: Cào 1 chapter 2 lần không sinh ra 2 dòng trên Database. | Chạy lại cùng 1 link Crawler, count Rows Database phải không đổi. |
| CR-03 | **Numeric Path Storage**: Thư mục ảnh lưu trên disk không chứa sub-string của slug thay đổi. | Kiểm tra cây thư mục tạo ra trên disk. Phải là `{comic_id}/chapter/{chapter_id}`. |
| CR-04 | **Order Validation**: Các index chap đánh lộn xộn (Oneshot, chap 2.1) phải được gán rank số thứ tự tăng dần. | Query SQL `ORDER BY order_index`, danh sách phải chuẩn tuyệt đối. |
| CR-05 | **Crawl Success Metric**: Chapter được count là "Success" ngay khi nhặt xong list ảnh và lưu URL vào database mà không cần đợi write file xong 100%. | Check worker status log trong thời gian ngắn. |
| CR-06 | **Category Auto-Slug**: Các category dạng text thô (Vd: "Hành động") phải được auto-slugify thành ID chuẩn (`hanh-dong`) và upsert vào bảng `categories`. | Query bảng `categories` sau khi sync truyện mới. |
| CR-07 | **Content Accuracy**: Các trường `author`, `description`, `title` không được trống. Nếu nguồn có dữ liệu, Database phải phản ánh đúng metadata đó. | Manual check SQL Record vs Source UI cho 5 truyện mẫu. |

---

## 2. Domain: Database (PostgreSQL)
| ID | Tiêu chí Nghiệm thu (Acceptance Criteria) | Phương pháp Xác thực (Verification) |
| --- | --- | --- |
| DB-01 | **Atomicity**: Cập nhật `worker_status` và insert Array Chapters bằng vòng Transaction khối. | Giả lập crash ngang code khi rải Insert, Tracking phải không bị ghi nhận láo. |
| DB-02 | **Unique Constraint**: Schema khóa trùng lặp theo cặp (`comic_id`, `chapter_number`). | Cố tình test Insert SQL thủ công 2 cặp giống nhau, output lỗi Unique Error. |
| DB-03 | **JSONB Dimension**: Cột `images` lưu trọn vẹn Dimensions ảnh `[{"file": "x", "w": 0, "h": 0}]`. | SELECT trực tiếp trường `images` và kiểm tra object con. |
| DB-04 | **Relational Integrity**: Dữ liệu Category và Comic mapping (`comic_categories`) phải chuẩn chỉnh, xóa Comic phải cascade mất mapping. | Thử xóa 1 record ở bảng `comics`, check bảng `comic_categories`. |
| DB-05 | **Auto-Migration Execution**: Hệ thống tự động apply các file `up.sql` mới khi khởi động mà không cần can thiệp thủ công. | Kiểm tra Log khởi động của container `crawler`. |
| DB-06 | **FE Ready Schema**: Bảng `comics` và `chapters` phải cung cấp đủ: Slug cho URL, Thumbnail cho Card, mảng Chapter được sort sẵn cho Reader. | Review GraphQL Schema Schema mapping với Database table structure. |

---

## 3. Domain: CDN imgflux (Rust)
| ID | Tiêu chí Nghiệm thu (Acceptance Criteria) | Phương pháp Xác thực (Verification) |
| --- | --- | --- |
| CDN-01 | **Progressive Fallback**: Get ảnh lần 1 (chưa cache) bị bắt trả về RAW ảnh kèm header chặn lưu đệm `Cache-Control: no-cache`. | Dùng lệnh `curl -I` đập vào ảnh mới, kiểm tra Header xuất ra. |
| CDN-02 | **Edge Cache Allowed**: Get ảnh lần 2 trả về bản nén WebP, sạch sẽ header "no-cache". | Tiếp tục dùng `curl -I`. Trọng lượng ảnh giảm (Webp), Response có lợi cho CloudFlare. |
| CDN-03 | **Thundering Herd Lock**: Gọi 100 Request đồng thời tới 1 ảnh nén lần đầu, không bị vọt > 90% CPU. | Dùng tool load-test `hey` test ảnh bốc random. Xem bảng Monitor CPU máy chủ. |
| CDN-04 | **No-artifact Resize**: Nối ảnh dọc truyện Webtoon không có viền nhiễu trắng do Compress. | Mở 2 bức ghép nối liền kề, Zoom UI 200%. |

---

## 4. Domain: GraphQL API Layer (Rust)
| ID | Tiêu chí Nghiệm thu (Acceptance Criteria) | Phương pháp Xác thực (Verification) |
| --- | --- | --- |
| GQL-01 | **Diesel Auto-gen**: Schema cấu trúc Rust hoàn toàn khớp 100% với file Auto Gen từ Diesel Migration. | Xóa file `schema.rs` và chạy lệnh Generate cục bộ lại, App không gãy logic. |
| GQL-02 | **LRU Capacity Limit**: Bộ nhớ Hash Memory Layer không phồng to mất kiểm soát. | Trực quan Tracking Memory của App Rust (< 100MB ổn định trong 10h). |
| GQL-03 | **Dataloader N+1**: Request gọi mảng 50 Truyện chứa Sub-Category chỉ xả đúng cực đại 2 câu SQL vào Postgres. | Bật Postgres Log/SQL Sniffer. Đếm câu Exec Query. |
| GQL-04 | **Cursor Pagination**: API danh sách có argument cấp Cursor `(sau id X / order_index Y)`. | Bắn Postman GraphQL Query truyền theo ID trỏ tới test hiệu năng fetch. |

---

## 5. Domain: Frontend (Astro)
| ID | Tiêu chí Nghiệm thu (Acceptance Criteria) | Phương pháp Xác thực (Verification) |
| --- | --- | --- |
| FE-01 | **Zero CLS Reader**: Cuộn dọc load ảnh chậm, layout vẫn giữ nguyên khung ko bị nhảy Page Shift. | Mở Google Chrome Network Tab, Set Throttle `Slow 3G`. Theo dõi thanh cuộn chừa box trước. |
| FE-02 | **Strict SEO Headers**: Mã nguồn xuất thẳng mã thẻ tĩnh `H1` duy nhất, `canonical`, `alt` hình tĩnh. | Mở Postman cào raw HTML (Vô hiệu Client JS). Ctrl F check số lượng `<H1>`, `alt`. |
| FE-03 | **LocalStorage Eviction**: Lịch sử chỉ duy trì giới hạn (500 dòng). Không phình vượt Quota. | Dùng JS spam fake 10.000 lịch sử vào LocalStorage, check mảng tự cắt bỏ Pop Array. |
| FE-04 | **Stateless Tracking**: Bookmark và Read List không phát sinh ra POST HTTP Network Request xuống GQL. | Thao tác save truyện yêu thích, check thẻ Chrome Network sạch nhiễu. |
