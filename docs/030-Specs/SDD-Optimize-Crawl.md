# SDD: Tối ưu hóa Crawl Budget cho SEO

## 1. Giới thiệu
Tài liệu này phác thảo các chiến lược và chi tiết triển khai để tối ưu hóa ngân sách thu thập dữ liệu (crawl budget) của dự án. Một crawl budget được quản lý tốt đảm bảo rằng Googlebot tập trung nguồn lực vào những nội dung quan trọng nhất và được cập nhật thường xuyên nhất, dẫn đến việc lập chỉ mục nhanh hơn và hiển thị tốt hơn trên công cụ tìm kiếm.

Tham khảo: [Google Search Central - Crawl Budget Management](https://developers.google.com/crawling/docs/crawl-budget)

## 2. Cơ sở lý thuyết
Google định nghĩa **Crawl Budget** là tập hợp các URL mà Googlebot có thể và muốn thu thập dữ liệu trên một trang web. Nó được xác định bởi hai yếu tố:
*   **Crawl Capacity Limit (Giới hạn khả năng thu thập):** Mức độ mà máy chủ có thể đáp ứng mà không bị quá tải.
*   **Crawl Demand (Nhu cầu thu thập):** Mức độ Google muốn thu thập dữ liệu dựa trên chất lượng trang, mức độ phổ biến và tần suất cập nhật.

## 3. Đánh giá dự án hiện tại
Dựa trên phân tích mã nguồn:
- **Sitemaps:** Triển khai thẻ `lastmod` linh hoạt. Nếu dữ liệu ngày tháng từ database (`publishedAt`) bị thiếu hoặc không hợp lệ, tag `<lastmod>` sẽ bị loại bỏ hoàn toàn thay vì sử dụng ngày hiện tại, nhằm đảm bảo tính trung thực cho Googlebot.
- **Slugification & Path Sanitization:** Toàn bộ đường dẫn trong sitemap (đặc biệt là Chapter) được chuẩn hóa (slugified) và thêm dấu gạch chéo cuối (`/`) để đồng nhất với URL thực tế trên trình duyệt.
- **Robots.txt:** Đã triển khai chặn cơ bản cho API và các lỗ hổng phổ biến (Honeypots), điều này tốt để giảm thiểu tiếng nhiễu.
- **Nội dung động:** Trang web cung cấp truyện tranh và chương truyện thay đổi thường xuyên, làm cho việc tối ưu hóa crawl budget trở nên quan trọng đối với các trang web có quy mô "Trung bình/Lớn".

## 4. Chiến lược tối ưu hóa

### A. Quản lý danh mục URL
*   **Hợp nhất nội dung trùng lặp:** Đảm bảo các thẻ canonical được triển khai chính xác (được xử lý trong các thành phần SEO metadata).
*   **Chặn có chiến lược:** Sử dụng `robots.txt` để chặn các đường dẫn không thiết yếu (ví dụ: `/api/`, cài đặt cá nhân, kết quả tìm kiếm nội bộ).
*   **404 so với Disallow:**
    *   Sử dụng **404/410** cho nội dung đã xóa để báo hiệu cho Google ngừng thu thập dữ liệu.
    *   Sử dụng **robots.txt Disallow** cho nội dung đang tồn tại nhưng không nên được lập chỉ mục để tiết kiệm ngân sách.

### B. Tối ưu hóa Sitemap
*   **Sử dụng `publishedAt` làm `lastmod`:** 
    *   Đối với Truyện (`Comic`): Sử dụng `publishedAt`. Giá trị này sẽ được cập nhật mỗi khi có chương mới hoặc chỉnh sửa thông tin quan trọng.
    *   Đối với Chương (`Chapter`): Sử dụng `publishedAt` (ngày phát hành chương).
    *   Đối với Thể loại (`Category`): Sử dụng `publishedAt` của truyện mới nhất trong thể loại đó.
    *   **Logic `lastmod`**: Trình tạo sitemap sẽ trả về `undefined` nếu ngày không hợp lệ. Tag `<lastmod>` sẽ chỉ hiển thị khi có dữ liệu tin cậy.
    *   **Trailing Slash**: Mọi URL trong sitemap bắt buộc có dấu `/` ở cuối.
    *   **Migration:** Tất cả các bản ghi hiện có sẽ được gán giá trị mặc định: `2026-03-07T07:56:40.915Z` (trừ trường hợp có ngày crawl thực tế chính xác hơn).
*   **Lập chỉ mục Sitemap:** Duy trì sitemap index để tránh các file XML quá lớn (đã triển khai).

### C. Cải thiện Crawl Capacity
*   **Hiệu suất máy chủ:** Thời gian phản hồi nhanh hơn sẽ tăng giới hạn khả năng thu thập dữ liệu.
*   **Giảm thiểu lỗi:** Hạn chế tối đa lỗi 5xx và lỗi soft 404.

## 5. Lộ trình triển khai

*   **Giai đoạn 1: Cập nhật API & Sitemap**
    *   Kiểm tra và bổ sung các trường timestamp (`updatedAt`, `createdAt`) vào GraphQL queries.
    *   Cập nhật các trình tạo sitemap (`sitemap-*.xml.ts`) để trích xuất và hiển thị `lastmod`.
    *   Đảm bảo định dạng ngày tuân thủ chuẩn ISO 8601 (W3C Datetime).

### Giai đoạn 2: Sàng lọc Robots.txt
*   Tiêu chuẩn hóa các quy tắc trong `robots.txt` để bao gồm các mẫu nội dung rác mới phát hiện (nếu có).

### Giai đoạn 3: Theo dõi
*   Kiểm tra thường xuyên báo cáo "Crawl Stats" trong Google Search Console để xác nhận xem việc tối ưu hóa có dẫn đến việc thu thập dữ liệu hiệu quả hơn cho các trang duy nhất hay không.

## 6. Kết luận
Bằng cách triển khai `lastmod` một cách triệt để và chính xác, chúng ta giúp Googlebot ưu tiên bò các nội dung vừa mới cập nhật, giúp truyện mới và chương mới được lập chỉ mục nhanh hơn, từ đó tăng hiệu quả SEO tổng thể.
