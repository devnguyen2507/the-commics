# QA Pre-Static SEO Checklist (fanmango.online)

Tài liệu này đóng vai trò là danh sách kiểm tra (QA/QC Checklist) dành cho giai đoạn đưa phiên bản static build (dist) lên môi trường chạy tạm (hoặc production sớm) nhằm mục đích **nhận index sớm từ Google**.

## 1. Mục tiêu (Objectives)
- Triển khai static site từ bản build hiện tại của UI (`dist/client`).
- Đảm bảo Google bot có thể crawl và index dễ dàng thông qua sitemap và robots.txt.
- Xác nhận các tiêu chuẩn SEO cơ bản trước khi đưa domain `fanmango.online` public hoàn toàn.

## 2. Các Môi trường Cần Cấu Hình và Kiểm tra
- **Local Testing:** Đang chạy tại `http://localhost:8888` (Python http.server).
- **Staging / Public Testing:** Sử dụng Cloudflare Tunnel hoặc host trực tiếp tại VPS và map cổng 8888 để SEO Lead có thể vào quét trực tiếp.

---

## 3. Checklist Thực thi QA/QC (SEO Technical)

### A. Kiểm tra `robots.txt`
- [ ] File `robots.txt` có thể truy cập ở URL hợp lệ: `https://fanmango.online/robots.txt`.
- [ ] Không chứa chỉ thị chặn các crawler quan trọng (Không có `Disallow: /` đối với User-agent: *).
- [ ] Chỉ định chính xác đường dẫn đến sitemap (Ví dụ: `Sitemap: https://fanmango.online/sitemap.xml`).

### B. Kiểm tra `sitemap.xml`
- [ ] File sitemap đã được gen ra bản thuần XML chuẩn ở `https://fanmango.online/sitemap.xml`.
- [ ] Sitemap chỉ chứa các URL chính cần được index (trang chủ, danh mục chính, một vài truyện/chapter tĩnh).
- [ ] Đảm bảo các URL trong sitemap trả về mã trạng thái `200 OK` (không có 3xx/4xx/5xx).
- [ ] Đã khai báo Sitemap này trên **Google Search Console** (nếu cấu hình xong domain).

### C. Tiêu chí On-page & Meta Tags (Kiểm tra bằng Extension SEO)
- [ ] **Title Tag:** Mỗi page có thẻ title duy nhất, rõ ràng (chứa từ khóa).
- [ ] **Meta Description:** Mỗi page có đoạn mô tả meta duy nhất (khoảng 150-160 ký tự).
- [ ] **Canonical Tag:** Kiểm tra thẻ `<link rel="canonical" href="..." />` xem có tự trỏ đúng chính xác về phiên bản URL hợp lý (tránh duplicate content do query params).
- [ ] **Robots Meta Tag:** Không chứa thẻ `<meta name="robots" content="noindex, nofollow">` ở những page muốn index.
- [ ] **Heading Tags:** Cấu trúc H1, H2, H3 logic. Chỉ có 1 thẻ `<h1>` chính trên mỗi page.
- [ ] **Open Graph (OG) / Twitter Cards:** Hiển thị preview chuẩn khi share qua mạng xã hội (`og:title`, `og:image`, `og:description`).

### D. Hiệu suất & Hỗ Trợ Đọc (Performance & Accessibility)
- [ ] Static files (JS/CSS/WebP images) được load ổn định không gây lỗi 404 (Kiểm tra trong F12 Network tab).
- [ ] Không có các chuỗi redirect vòng lặp cho các tài nguyên core.

---

## 4. Kế Hoạch Chuyển Giao cho SEO Lead
1. QA Engineer / Dev tự pass các checklist ở mục 3 trên môi trường local (port `8888`).
2. Public port ra một URL có thể truy cập ở bên ngoài (thông qua ngrok, thư mục dist đẩy lên Cloudflare Pages tạm hoặc domain staging trên VPS).
3. Bàn giao link public cho **SEO Lead**.
4. Thiết lập phiên nghiệm thu: SEO Lead sẽ xài Screaming Frog / SEOQuake / Ahrefs để cào toàn bộ source, rà soát Technical SEO.
5. Ghi nhận lỗi / Điều chỉnh trực tiếp build process (ví dụ Vite plugin tạo sitemap/robots).

**Conclusion:** Kế hoạch này bảo đảm 100% khi index trang sẽ nhận đúng tín hiệu tích cực mà không dính “dớp” bad history do cấu hình lỗi.
