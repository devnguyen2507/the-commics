# Hướng dẫn Deploy Static Build lên Cloudflare (fanmango.art)

Vì bạn đã có sẵn domain `fanmango.art` trên Cloudflare và đang chạy bản static build tại cổng `8888` ở local (`src/ui/dist/client`), tôi đề xuất 2 phương án tùy theo mục đích thực tế của bạn:

## Phương án 1 (Khuyên dùng cho SEO Live): Dùng Cloudflare Pages
Đưa thẳng thư mục `dist` lên Cloudflare hosting miễn phí. Tốc độ load cực nhanh (CDN toàn cầu), hỗ trợ trỏ domain rất dễ dàng và ổn định, không cần bật máy tính ở local.

**Bước 1: Cài đặt và Login cấu hình Wrangler (Cloudflare CLI)**
Mở một terminal mới và chạy:
```bash
npm install -g wrangler
wrangler login
```
*(Trình duyệt sẽ mở ra để bạn đăng nhập và xác thực Cloudflare)*

**Bước 2: Deploy thư mục static**
Chạy lệnh sau tại thư mục chứa source của bạn:
```bash
cd src/ui/dist/client
npx wrangler pages deploy . --project-name fanmango-seo
```

**Bước 3: Trỏ domain `fanmango.art` vào project vừa deploy**
1. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Cột trái chọn **Workers & Pages** -> Bấm vào project `fanmango-seo` vừa tạo.
3. Chuyển qua tab **Custom Domains** -> **Set up a custom domain**.
4. Nhập `fanmango.art` (hoặc `www.fanmango.art`) và làm theo hướng dẫn. Cloudflare sẽ tự cấu hình DNS và SSL cho bạn.

---

## Phương án 2 (Dùng để SEO Lead check tạm thời): Dùng Cloudflare Tunnel
Ánh xạ (map) trực tiếp cổng `8888` ở local máy bạn ra thẳng domain `fanmango.art`.
*Lưu ý: Cách này đòi hỏi máy bạn [đang chạy cổng 8888] phải luôn mở và có mạng.*

**Bước 1: Cài đặt Cloudflared (nếu dùng Mac)**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Bước 2: Login vào Cloudflare Tunnel**
```bash
cloudflared tunnel login
```
*(Trình duyệt sẽ mở ra, bạn chọn domain `fanmango.art` để authorize)*

**Bước 3: Tạo và chạy Tunnel trỏ vào port 8888**
```bash
# Tạo tunnel tên là seo-test
cloudflared tunnel create seo-test

# Trỏ domain fanmango.art vào tunnel vừa tạo
cloudflared tunnel route dns seo-test fanmango.art

# Chạy tunnel nối HTTPS của domain vào port 8888 local
cloudflared tunnel run --url http://localhost:8888 seo-test
```

➡️ **Sau khi chạy:** Bạn và SEO Lead có thể truy cập thẳng `https://fanmango.art` để check các tiêu chí SEO bằng extension.

---
**Bạn muốn đi theo Phương án 1 (Host lâu dài, tối ưu) hay Phương án 2 (Chỉ test local tạm thời)? Hãy báo lại để tôi hỗ trợ chạy lệnh trực tiếp nếu cần nhé!**
