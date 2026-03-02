# Báo cáo QA/QC Review PRD & Specifications

**Mục tiêu**: Đóng vai trò QA/QC và Principal Engineer để review lỗ hổng, edge-cases và đưa ra đề xuất cải tiến cho 5 documents PRD & Spec của dự án Commics trước khi bắt tay lập biên bản nghiệm thu (Acceptance Criteria) và đưa vào báo giá/implement.

---

## 1. Domain: Crawler Engine (PRD-020, Spec-002)

### 🚨 Lỗ hổng & Edge Cases phát hiện
1. **Lỗ hổng (Score 8/10): Xung đột sao chép dữ liệu (Duplication)**
   - *Vấn đề*: Crawler có thể vô tình chạy lại một chapter hoặc một truyện 2 lần. PRD hiện tại chưa đề cập đến cơ chế xử lý conflict khi Insert vào Database (ví dụ `ON CONFLICT DO UPDATE`). Nếu không chặn, Database sẽ sinh rác và lặp chương.
   - *Đề xuất*: Bổ sung quy định bắt buộc set Unique Constraints trong DB và áp dụng logic Upsert (Update if exists, Insert if not) dựa trên `source_url` hoặc `(comic_id, chapter_number)`.

2. **Lỗ hổng (Score 6/10): Biến động URL Storage Path**
   - *Vấn đề*: Nếu lấy `slug` của truyện làm tên folder chứa ảnh (`/storage/commics/<slug>/`), lỡ web đổi tên truyện (đổi slug) thì toàn bộ path trỏ vào ảnh sẽ bị gãy.
   - *Đề xuất*: Khóa chặt quy tắc tạo thư mục `storage_path` chỉ bằng ID UUID nội bộ hoặc Source Numeric ID bất biến.

## 2. Domain: Database (PRD-021, Spec-003)

### 🚨 Lỗ hổng & Edge Cases phát hiện
1. **Thiếu sót (Score 8/10): Không đảm bảo tính Atomicity**
   - *Vấn đề*: Việc update trạng thái Crawler tracking (`worker_last_run`, `worker_status`) và việc Insert 100 Chapter đang là 2 hành động rời rạc. Nếu insert được 50 chap rồi crash thì tracking status vẫn lơ lửng.
   - *Đề xuất*: Buộc phải nằm trong cùng một SQL Transaction khối (Atomic Commit).

2. **Thiếu sót (Score 9/10): Lưu JSONB quá sơ sài ảnh hưởng Frontend CLS**
   - *Vấn đề*: Trích xuất từ yêu cầu Frontend phải thiết lập CLS = 0. Nhưng nếu Database chỉ lưu Text HTML `["01.jpg", "02.jpg"]`, Frontend sẽ không tài nào biết được Width/Height thực tế của ảnh để reserve Box Placeholder khi lazy load chờ CDN.
   - *Đề xuất*: `images` JSONB phải đổi cấu trúc thành mảng Objects bao gồm Dimension. VD: `[{"file": "01.jpg", "w": 800, "h": 1200}]`. (Bắt buộc Crawler ở khâu download phải read được Image Dimension).

## 3. Domain: CDN imgflux (PRD-023)

### 🚨 Lỗ hổng & Edge Cases phát hiện
1. **Lỗ hổng (Score 9/10): Thundering Herd Problem (Cạnh tranh tài nguyên CPU)**
   - *Vấn đề*: Giả sử 1 ảnh mới hoàn toàn chưa được cache. 100 User click vào xem cùng lúc. CDN sẽ trigger 100 luồng (threads) Background cùng lúc để gồng nén chung 1 file ảnh này sang WebP. Gây cháy nổ CPU Server ngay lập tức.
   - *Đề xuất*: Phải có cơ chế khóa (File Lock / Atomic state) ở layer Background Processing. Yêu cầu request đầu tiên đánh dấu "Processing khóa", 99 request sau đến chỉ lấy file RAW trả thẳng không kích hoạt hàm nén nữa.

2. **Thiếu sót (Score 7/10): Ảnh gốc bị hỏng (Broken Source)**
   - *Vấn đề*: File zip/ảnh crawler kéo về là 0 byte hoặc tệp ảnh mẻ do HTTP timeout 1 nửa. Trình compressor đọc sẽ crash và loop crash vĩnh viễn.
   - *Đề xuất*: Thêm Validate File Signature Header (kiểm tra byte magic) trước khi nén để gán cờ `uncompressible_error`.

## 4. Domain: GraphQL API Layer (PRD-022, Spec-004)

### 🚨 Lỗ hổng & Edge Cases phát hiện
1. **Lỗ hổng (Score 8/10): Rò rỉ bộ nhớ Cache (Memory Leak)**
   - *Vấn đề*: PRD dùng Tầng 1 là "In-Memory HashMap". Nếu số lượng cache set càng ngày càng phình, RAM ứng dụng Rust sẽ tràn, gây panic OOM (Out Of Memory) kill chết ứng dụng.
   - *Đề xuất*: HashMap phải nâng cấp lên thành LRU Cache (Least Recently Used) có quy định `capacity` (VD: tối đa 5000 item), khi đầy sẽ tự vứt bớt item cũ nhất. Rất quan trọng cho stability.

2. **Hạn chế (Score 7/10): Bất lợi Offset/Limit Pagination**
   - *Vấn đề*: Bảng `chapters` hoặc `comics` khi lên vài triệu dòng, truy vấn dùng Offset 1.000.000 quét DB Postgres sẽ cực chậm (Full table scan). 
   - *Đề xuất*: Bắt buộc chuyển chiến lược List API sang chuẩn Cursor-based Pagination (Dùng `order_index` làm cursor) cho bảng lớn.

## 5. Domain: Frontend Astro (PRD-024, Spec-006)

### 🚨 Lỗ hổng & Edge Cases phát hiện
1. **Lỗ hổng (Score 6/10): Quota Storage Browser Limit**
   - *Vấn đề*: Vì cấm Client ghi Read History lên Database server, đẩy sang xài LocalStorage Browser (dung lượng tối đa 5MB). Nếu lưu Text base không cleanup, lịch sử phình quá 5MB ném error quota exceeded -> Chết UI.
   - *Đề xuất*: Phải set Slice Array / Eviction (Mỗi thiết bị chỉ lưu lịch sử 500 truyện đọc gần nhất, cũ hơn bị pop ra).

## KẾT LUẬN & HÀNH ĐỘNG
Các lỗ hổng nghiêm trọng đã được khắc phục hoàn toàn trong Phase 3:
- [x] **Memory Leak**: Đã chuyển sang `moka` LRU Cache với giới hạn capacity.
- [x] **Pagination Performance**: Đã áp dụng `first/after` logic cho bảng lớn.
- [x] **CLS Layout Shift**: Đã chuẩn hóa JSONB `images` và resolver GraphQL để trả về `w/h`.

Hệ thống hiện tại đã đủ điều kiện bàn giao cho Frontend.
