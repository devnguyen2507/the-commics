# VPS + Cloudflare + SSL Setup Guide

**Đây là tài liệu kỹ thuật cho việc cấu hình Staging Production. Không có hướng dẫn thừa.**

---

## 1. Chọn VPS & Mua IP

### Nhà cung cấp khuyến nghị (2026)

| Provider | Plan | RAM | vCPU | Giá/tháng | Floating IP | Snapshot |
|---|---|---|---|---|---|---|
| **Hetzner** (khuyến nghị) | CX21 | 4GB | 2 | ~€5.9 | ✅ €2/IP | ✅ Miễn phí |
| DigitalOcean | Basic | 2GB | 1 | ~$12 | ✅ $4/IP | ✅ $0.06/GB |
| Vultr | Regular | 4GB | 2 | ~$12 | ✅ $3/IP | ✅ |
| Linode (Akamai) | Shared | 4GB | 2 | ~$18 | ✅ | ✅ |

**Khuyến nghị Hetzner** vì giá tốt nhất ở châu u và châu Á (Singapore datacenter). Nếu target audience ở Việt Nam thì chọn **Singapore** datacenter.

### Sau khi mua VPS
- Hệ điều hành: Chọn **Ubuntu 22.04 LTS** hoặc **24.04 LTS**.
- Ghi lại: **Public IP** của VPS (ví dụ: `123.45.67.89`).
- Tạo SSH Key, cài vào VPS ngay khi tạo. Không dùng mật khẩu SSH.

> **Lưu ý về Floating IP:**  
> Nếu muốn đổi IP nhanh khi bị lộ (5-10 phút, zero downtime), hãy mua thêm 1 Floating IP ngay từ đầu và **gán nó** vào VPS thay vì dùng IP chính. Tất cả cấu hình Cloudflare sau đây sẽ trỏ vào Floating IP này.

---

## 2. Đăng ký Domain & Kết nối Cloudflare

### Bước 2.1 — Đăng ký Domain (nếu chưa có)

Chọn registrar uy tín:
- **Cloudflare Registrar** (khuyến nghị): Giá at-cost, không markup, quản lý DNS cùng chỗ.
- **Namecheap**: Rẻ, hỗ trợ tốt.
- **Google Domains** (đã bán lại cho Squarespace): Vẫn hoạt động tốt.

---

### Bước 2.2 — Thêm Domain vào Cloudflare

1. Đăng nhập [dash.cloudflare.com](https://dash.cloudflare.com).
2. Click **Add a Site** → Nhập domain (ví dụ: `staging.commics.com` hoặc domain chính `commics.com`).
3. Chọn Plan:
   - **Free**: Đủ dùng cho Staging. DDoS L3/L4, HTTPS, WAF 5 rules.
   - **Pro ($20/mo)**: Nên nâng lên khi đi Production thật. Có WAF Managed Rulesets, Bot Management tốt hơn.
4. Cloudflare sẽ đọc DNS records hiện tại và liệt kê. Nhấn Next.
5. Cloudflare cấp cho bạn 2 **Nameserver** (ví dụ: `alice.ns.cloudflare.com` và `bob.ns.cloudflare.com`).

---

### Bước 2.3 — Đổi Nameserver ở Registrar

Vào Registrar (nơi mua domain), tìm mục **Nameservers / Custom DNS** và thay 2 nameserver mặc định bằng 2 nameserver Cloudflare vừa cấp.

**Lưu**: Propagation DNS mất từ 5 phút đến 24 giờ. Cloudflare sẽ email báo khi active.

---

## 3. Cấu hình DNS Records trong Cloudflare

Sau khi domain active trong Cloudflare, vào **DNS → Records** để tạo các record sau:

### Record chính (Trỏ domain về VPS)

| Type | Name | Content | TTL | Proxy Status |
|---|---|---|---|---|
| `A` | `@` | `YOUR_VPS_IP` | Auto | ☁️ **Proxied** |
| `CNAME` | `www` | `@` hoặc `yourdomain.com` | Auto | ☁️ **Proxied** |
| `A` | `staging` | `YOUR_VPS_IP` | Auto | ☁️ **Proxied** |

> **CRITICAL**: Proxy Status phải là **☁️ Proxied (Orange Cloud)**, KHÔNG phải DNS Only (Grey Cloud).  
> Grey Cloud = IP VPS bị lộ hoàn toàn. Kẻ tấn công có thể bypass Cloudflare, đánh trực tiếp vào IP VPS dù firewall.

### Các record KHÔNG được proxy (nếu cần)

| Type | Name | Content | Proxy |
|---|---|---|---|
| `MX` | `@` | Mail server address | ❮ DNS Only |
| `TXT` | `@` | SPF/DKIM/verification | ❮ DNS Only |

> Email phải **DNS Only** vì Cloudflare không proxy SMTP.

---

## 4. Cấu hình SSL/TLS trong Cloudflare

### SSL Mode — Phải set đúng

Vào **SSL/TLS → Overview**, chọn:

**`Full (Strict)`** ← Đây là lựa chọn ĐÚNG DUY NHẤT cho production.

| Mode | Mô tả | Dùng khi |
|---|---|---|
| Off | HTTP thuần, không mã hóa | **Không bao giờ** |
| Flexible | CF encrypt với client, nhưng kết nối CF→VPS là HTTP | **Không bao giờ** — Man-in-the-middle giữa CF và VPS |
| Full | CF encrypt cả 2 chiều, nhưng không verify cert trên VPS | Chỉ dùng với self-signed cert |
| **Full (Strict)** | CF verify cert VPS phải do CA tin cậy cấp | **Đây** |

---

### Cài SSL Certificate trên VPS

Cloudflare không tự cài cert lên VPS của bạn. Bạn phải cài cert để Nginx trên VPS serve HTTPS.

**Cách A: Let's Encrypt (Khuyến nghị — Miễn phí)**

SSH vào VPS, chạy:
```bash
# Cài Certbot
apt update && apt install -y certbot python3-certbot-nginx

# Cấp cert (thay bằng domain thật)
certbot --nginx -d staging.commics.com
```

Certbot sẽ tự sửa file Nginx config của bạn để thêm SSL. Auto-renew qua cronjob được setup sẵn.

> Vấn đề: Certbot cần port 80 mở để Let's Encrypt xác thực. Vì Firewall của chúng ta chỉ mở cho Cloudflare, cần **tạm thời tắt tường lửa** hoặc dùng DNS challenge:

```bash
# Dùng DNS challenge (không cần port 80 mở)
certbot certonly --manual --preferred-challenges dns -d staging.commics.com

# Cert được hỏi: "Add TXT record _acme-challenge.staging.commics.com với giá trị XXXX"
# Bạn vào Cloudflare Dashboard thêm TXT record đó (DNS Only, không proxy), rồi nhấn Enter.
```

**Cách B: Cloudflare Origin Certificate (Dễ hơn cho người mới)**

1. Vào Cloudflare → **SSL/TLS → Origin Server** → **Create Certificate**.
2. Cloudflare tạo cert `.pem` và private key `.key`. Download về.
3. Upload cert lên VPS:
```bash
mkdir -p /etc/nginx/ssl/
# Dán nội dung cert vào /etc/nginx/ssl/origin.pem
# Dán nội dung key vào /etc/nginx/ssl/origin.key
chmod 600 /etc/nginx/ssl/origin.key
```
4. Cập nhật Nginx config:
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/origin.pem;
    ssl_certificate_key /etc/nginx/ssl/origin.key;
    ...
}
```

> Origin Certificate chỉ được Cloudflare tin, không phải CA công khai. Nghĩa là nếu có người truy cập IP VPS trực tiếp (bypass Cloudflare), trình duyệt báo lỗi cert. Đây là behavior đúng — bạn không muốn ai bypass Cloudflare.

---

## 5. Cloudflare Security Settings (Bắt Buộc)

### SSL/TLS Settings

Vào **SSL/TLS → Edge Certificates**:
- **Always Use HTTPS**: ✅ ON
- **HTTP Strict Transport Security (HSTS)**: Bật với `max-age=315360000` (1 năm) sau khi test xong.
- **Minimum TLS Version**: TLS 1.2
- **Opportunistic Encryption**: ✅ ON

### Security Headers via Transform Rules (Thay thế cho Nginx header)

Cloudflare Free cho phép tạo Rule inject HTTP response headers **ngay tại Edge** mà không cần Nginx.

Vào **Rules → Transform Rules → Modify Response Header** → Create Rule:

**Rule name**: `Security Headers`  
**Condition**: `(http.host eq "staging.commics.com")`

| Action | Header Name | Value |
|---|---|---|
| Set static | `X-Frame-Options` | `SAMEORIGIN` |
| Set static | `X-Content-Type-Options` | `nosniff` |
| Set static | `Referrer-Policy` | `strict-origin-when-cross-origin` |
| Set static | `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

> Với CSP (`Content-Security-Policy`) phức tạp hơn — nếu set tại Cloudflare sẽ áp dụng cho toàn domain. Hãy test kỹ trên staging trước khi set cho production vì CSP sai sẽ break JS, CSS, hình ảnh.

### WAF Rules (Firewall)

Vào **Security → WAF → Custom Rules** → Create Rule:

**Rule 1**: Block scan bots xấu
```
(http.user_agent contains "sqlmap") or
(http.user_agent contains "nikto") or
(http.user_agent contains "zgrab") or
(http.user_agent contains "masscan")
```
→ Action: **Block**

**Rule 2**: Rate limit API endpoint (nếu dùng Pro)  
Free tier chỉ có 1 custom rule, nên dùng cho Rule 1.

---

## 6. Verify Setup

Sau khi toàn bộ cấu hình xong, kiểm tra:

```bash
# 1. Kiểm tra DNS propagation
dig staging.commics.com A
# Phải trả về IP Cloudflare (103.x.x.x, 104.x.x.x), KHÔNG phải IP VPS

# 2. Kiểm tra SSL
curl -vI https://staging.commics.com 2>&1 | grep -E "SSL|TLS|subject|issuer"
# Phải thấy cert từ Cloudflare hoặc Let's Encrypt

# 3. Kiểm tra Security Headers
curl -I https://staging.commics.com | grep -E "x-frame|x-content|referrer"

# 4. Kiểm tra IP VPS KHÔNG bị expose
# Vào https://search.censys.io/hosts/YOUR_VPS_IP
# Nếu port 80/443 không hiện service HTTP → iptables đang hoạt động đúng
```

---

## 7. Checklist Cuối Cùng

| # | Task | Kết quả |
|---|---|---|
| 1 | VPS OS: Ubuntu 22/24 LTS, SSH Key-based auth | ✅ / ❌ |
| 2 | Domain trỏ đúng Cloudflare Nameserver | ✅ / ❌ |
| 3 | A Record trỏ về VPS IP, **Proxy Status = Proxied** | ✅ / ❌ |
| 4 | SSL/TLS Mode = **Full (Strict)** | ✅ / ❌ |
| 5 | Cert installed trên VPS (Let's Encrypt hoặc Origin Cert) | ✅ / ❌ |
| 6 | Always Use HTTPS = ON | ✅ / ❌ |
| 7 | `dig` trả về IP Cloudflare (không phải IP VPS) | ✅ / ❌ |
| 8 | Chạy `bootstrap.sh` thành công | ✅ / ❌ |
| 9 | `curl -I https://domain.com` trả về `200` | ✅ / ❌ |
| 10 | Security Headers xuất hiện trong response | ✅ / ❌ |

---

## 8. Cloudflare Free vs Pro — Nên Dùng Gói Nào?

### So sánh chi tiết

| Tính năng | Free | Pro ($20/mo) | Business ($200/mo) |
|---|---|---|---|
| DDoS Protection L3/L4 | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| DDoS L7 (HTTP floods) | Cơ bản | ✅ Advanced | ✅ Advanced+ |
| SSL/TLS (Edge cert) | ✅ | ✅ | ✅ |
| Custom SSL (upload cert) | ❌ | ✅ | ✅ |
| WAF Managed Rulesets (OWASP) | ❌ | ✅ | ✅ |
| WAF Custom Rules | 5 rules | 20 rules | 100 rules |
| Page Rules | 3 | 20 | 50 |
| Rate Limiting | ❌ | ✅ (100k req/mo miễn phí) | ✅ |
| Bot Management | Cơ bản | ✅ Super Bot Fight Mode | ✅ Advanced |
| Cloudflare Analytics | 24h lookback | 7 days | 30 days |
| Image Optimization (Polish/Mirage) | ❌ | ✅ | ✅ |
| Cache Analytics | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ Email | ✅ Chat |
| Workers (Serverless) | 100k req/day | 100k req/day | 10M req/mo |

### Quyết định

```
Staging → Free (hoàn toàn đủ)
Production nhỏ (< 50k user/ngày) → Free hoặc Pro
Production có traffic lớn / manga site → Pro bắt buộc vì:
    - WAF Managed Rulesets chặn SQL injection, XSS tự động
    - Image optimization (Webp, resize) cho CF CDN
    - Rate limiting ngăn scraper
    - Bot fight mode ngăn bot đọc content hàng loạt
```

---

## 9. Hướng Dẫn Tạo DNS Records — Chi Tiết Từng Bước

### 9.1 Vào DNS Dashboard

```
dash.cloudflare.com → Chọn domain → DNS → Records → + Add record
```

### 9.2 Record A — Trỏ Domain Gốc về VPS

```
Type:    A
Name:    @              ← Đại diện cho domain gốc (yourdomain.com)
IPv4:    123.45.67.89   ← IP VPS thật của bạn
TTL:     Auto
Proxy:   ON (☁️ Orange Cloud)  ← BẮT BUỘC
```

→ Click **Save**

### 9.3 Record CNAME — www redirect về domain gốc

```
Type:    CNAME
Name:    www
Target:  yourdomain.com   ← hoặc @ (tùy Cloudflare UI)
TTL:     Auto
Proxy:   ON (☁️ Orange Cloud)
```

→ Click **Save**

### 9.4 Record A — Subdomain staging

```
Type:    A
Name:    staging          ← tạo staging.yourdomain.com
IPv4:    123.45.67.89     ← Cùng IP VPS (hoặc IP VPS khác nếu có)
TTL:     Auto
Proxy:   ON (☁️ Orange Cloud)
```

### 9.5 Record A — API subdomain (nếu cần)

```
Type:    A
Name:    api
IPv4:    123.45.67.89
TTL:     Auto
Proxy:   ON
```

### 9.6 Record TXT — Xác minh domain ownership (Google Search Console, v.v.)

```
Type:    TXT
Name:    @
Content: google-site-verification=AbCdEf123...
TTL:     Auto
Proxy:   OFF (DNS Only — TXT record không được proxy)
```

### 9.7 Giải thích Proxy Status

```
☁️ Orange (Proxied):
  - Traffic: Client → Cloudflare PoP → VPS
  - IP hiển thị: IP Cloudflare (103.x / 104.x / 108.x)
  - Lợi ích: DDoS protection, WAF, SSL edge, caching
  - Dùng cho: Web traffic (port 80, 443)

⬜ Grey (DNS Only):
  - Traffic: Client → VPS trực tiếp
  - IP hiển thị: IP VPS thật
  - Lợi ích: Kết nối trực tiếp, không qua CF
  - Dùng cho: Mail (MX), SSH, FTP, game server, TXT verify
```

> **Nguyên tắc**: Bất kỳ record nào expose IP VPS ra ngoài (dù không proxy) thì kẻ tấn công có thể tìm IP VPS qua historical DNS lookup (SecurityTrails, ViewDNS.info). Nếu lo ngại, có thể dùng **Cloudflare Tunnel** (xem Mục 12).

---

## 10. SSL Certificate — Đặt Ở Đâu Và Cấu Hình Thế Nào?

### 10.1 Kiến trúc SSL 2 lớp

```
Browser ←──── HTTPS ────→ Cloudflare Edge ←──── HTTPS ────→ VPS (Nginx)
               (CF cert)                        (Origin cert)
```

Bạn cần 2 chứng chỉ:
- **Edge cert** (giữa User và Cloudflare): Cloudflare tự lo, bạn không cần làm gì.
- **Origin cert** (giữa Cloudflare và VPS): **Bạn phải cài!**

### 10.2 Vị trí lưu SSL trên VPS

```
/etc/ssl/                     ← Standard system SSL dir
/etc/nginx/ssl/               ← Nginx-specific (custom)
/etc/letsencrypt/live/<domain>/  ← Let's Encrypt cấp tự động ở đây
```

**Cấu trúc file Let's Encrypt** (sau khi chạy certbot):
```
/etc/letsencrypt/live/yourdomain.com/
├── cert.pem        ← Certificate (không dùng file này độc lập)
├── chain.pem       ← Intermediate chain
├── fullchain.pem   ← cert.pem + chain.pem (DÙNG CÁI NÀY cho Nginx)
└── privkey.pem     ← Private key (DÙNG CÁI NÀY)
```

**Cấu trúc file Cloudflare Origin Certificate** (tự tạo và đặt):
```
/etc/nginx/ssl/
├── origin.pem      ← Cert từ Cloudflare dashboard (paste vào đây)
└── origin.key      ← Private key từ Cloudflare dashboard (paste vào đây)
```

### 10.3 Let's Encrypt — Cài Tự Động (Khuyến nghị Production)

```bash
# Bước 1: Cài Certbot với Nginx plugin
apt update && apt install -y certbot python3-certbot-nginx

# Bước 2a: HTTP challenge (port 80 phải mở từ internet)
# Nếu dùng iptables Cloudflare-only, cần tạm thời mở port 80 cho mọi IP
iptables -I INPUT -p tcp --dport 80 -j ACCEPT
certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Sau đó restore rules
iptables -D INPUT -p tcp --dport 80 -j ACCEPT

# Bước 2b: DNS challenge (KHÔNG cần mở port — dùng khi firewall strict)
certbot certonly --manual --preferred-challenges dns \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d staging.yourdomain.com

# Certbot sẽ yêu cầu bạn thêm TXT record như sau:
# → Vào Cloudflare DNS Dashboard
# → Add record: Type=TXT, Name=_acme-challenge, Content=<giá_trị_hiển_thị>, Proxy=OFF
# → Đợi 30s rồi nhấn Enter trong terminal
```

**Auto-renewal** — Let's Encrypt cert expire sau 90 ngày. Certbot tự renew qua systemd timer:

```bash
# Kiểm tra timer
systemctl status certbot.timer

# Test thử renewal (dry run)
certbot renew --dry-run

# Nếu chưa có timer, thêm vào crontab
echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'" | crontab -
```

### 10.4 Cloudflare Origin Certificate — Cài Thủ Công

Dùng khi: Bạn muốn tránh complexity của Let's Encrypt, chấp nhận cert chỉ valid với Cloudflare.

**Bước 1**: Cloudflare Dashboard → **SSL/TLS → Origin Server** → **Create Certificate**

```
Configure:
- Private key type: RSA (2048) hoặc ECDSA P-256 (nhỏ hơn, nhanh hơn)
- Hostnames: yourdomain.com, *.yourdomain.com  ← Wildcard để cover tất cả subdomain
- Certificate Validity: 15 years (chọn max để không cần renew)
```

→ Click **Create** → Cloudflare hiển thị **Origin Certificate** và **Private Key**

> ⚠️ **CRITICAL**: Sao chép Private Key NGAY LÚC NÀY. Cloudflare sẽ không hiển thị lại.

**Bước 2**: SSH vào VPS, tạo files:

```bash
mkdir -p /etc/nginx/ssl
# Paste cert vào:
nano /etc/nginx/ssl/origin.pem
# Paste private key vào:
nano /etc/nginx/ssl/origin.key

# Bảo mật
chmod 644 /etc/nginx/ssl/origin.pem
chmod 600 /etc/nginx/ssl/origin.key
chown root:root /etc/nginx/ssl/origin.key
```

**Bước 3**: Thêm vào Nginx config:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/nginx/ssl/origin.pem;
    ssl_certificate_key /etc/nginx/ssl/origin.key;

    # SSL ciphers (modern profile)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS (bật sau khi test SSL xong)
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:3000;  # hoặc port app của bạn
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

```bash
# Kiểm tra config hợp lệ
nginx -t

# Reload
systemctl reload nginx
```

### 10.5 So sánh Let's Encrypt vs Cloudflare Origin Cert

| | Let's Encrypt | Cloudflare Origin Cert |
|---|---|---|
| Cấp bởi | Let's Encrypt CA (public) | Cloudflare CA (private) |
| Hạn sử dụng | 90 ngày | 15 năm |
| Cần auto-renew | ✅ Có | ❌ Không |
| Công nhận bởi | Tất cả browsers | **Chỉ Cloudflare** |
| Nếu bypass CF | Browser tin | Browser báo lỗi |
| Độ phức tạp | Trung bình (DNS challenge) | Thấp (copy-paste) |
| Wildcard cert | ✅ (DNS challenge) | ✅ (native) |
| **Khuyến nghị** | Production mọi trường hợp | Staging / nếu muốn đơn giản |

---

## 11. Cloudflare Page Rules & Cache Settings

### 11.1 Page Rules (Free: 3 rules)

Vào **Rules → Page Rules** → Create Page Rule:

**Rule 1**: Cache tất cả static assets

```
URL:     yourdomain.com/static/*
Setting: Cache Level → Cache Everything
         Edge Cache TTL → 1 month
```

**Rule 2**: Bypass cache cho API

```
URL:     yourdomain.com/api/*
Setting: Cache Level → Bypass
```

**Rule 3**: Force HTTPS

```
URL:     http://yourdomain.com/*
Setting: Always Use HTTPS
```

> Với Pro plan, dùng **Cache Rules** (mạnh hơn Page Rules, không giới hạn 3 rules).

### 11.2 Caching tối ưu cho manga/image site

Vào **Caching → Configuration**:

```
Caching Level:      Standard
Browser Cache TTL:  4 hours (respect existing headers)
```

Với Con Pro, bật **Polish** (Caching → Optimization):
- **Polish**: Lossless hoặc Lossy (nén ảnh PNG/JPEG tự động)
- **WebP**: Tự convert ảnh sang WebP cho browser hỗ trợ
- **Mirage**: Lazy load + responsive images tự động

---

## 12. Cloudflare Tunnel — Ẩn Hoàn Toàn IP VPS (Nâng Cao)

Nếu bạn muốn **không cần mở port nào trên VPS** (kể cả 80/443), dùng Cloudflare Tunnel. VPS sẽ tạo outbound connection tới Cloudflare — không có inbound connection nào.

```
Internet → Cloudflare → [Tunnel] → VPS (all inbound ports CLOSED)
```

### Cài đặt

```bash
# Cài cloudflared trên VPS
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
dpkg -i cloudflared.deb

# Login (mở browser để xác thực)
cloudflared tunnel login

# Tạo tunnel
cloudflared tunnel create my-tunnel

# Cấu hình tunnel
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:80
  - hostname: staging.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# Tạo DNS record tự động (CNAME về tunnel endpoint)
cloudflared tunnel route dns my-tunnel yourdomain.com
cloudflared tunnel route dns my-tunnel staging.yourdomain.com

# Chạy tunnel như service
cloudflared service install
systemctl start cloudflared
systemctl enable cloudflared
```

**Lợi ích Tunnel vs Port Forward:**
- Không cần mở bất kỳ port nào (iptables mặc định DROP tất cả inbound)
- Không cần Floating IP hay lo IP bị lộ
- SSL tự động (CF quản lý)
- Tunnel cert = Cloudflare Origin Cert nội bộ

**Nhược điểm:**
- Phụ thuộc cloudflared process trên VPS
- Nếu cloudflared crash → site down
- Không dùng được `SSL Full (Strict)` mode — dùng mode `Full` hoặc `Flexible` với tunnel

> Với setup đơn giản ban đầu, **dùng Mục 4 (Nginx + Cert)** là đủ và ổn định hơn. Tunnel phù hợp sau khi đã quen với hệ thống.

---

## 13. Troubleshooting — Các Lỗi Thường Gặp

### 13.1 "SSL Handshake Failed" / ERR_SSL_PROTOCOL_ERROR

**Nguyên nhân phổ biến**:
1. SSL mode đặt là `Full (Strict)` nhưng VPS chưa cài cert → **Cài cert trước, sau đó mới set Full Strict**
2. Cert đã hết hạn
3. Nginx chưa reload sau khi cài cert

```bash
# Kiểm tra cert còn hạn không
certbot certificates
# hoặc
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem

# Reload Nginx
systemctl reload nginx
```

### 13.2 "Too Many Redirects" (ERR_TOO_MANY_REDIRECTS)

**Nguyên nhân**: SSL mode = `Flexible` + Nginx redirect HTTP → HTTPS → Cloudflare chuyển ngược lại HTTP → vòng lặp vô tận.

**Fix**: Đổi SSL mode thành `Full` hoặc `Full (Strict)` trong Cloudflare Dashboard.

### 13.3 dig trả về IP VPS thay vì IP Cloudflare

```bash
dig yourdomain.com A +short
# Nếu ra IP VPS (123.45.x.x) → Proxy chưa bật
```

**Fix**: Vào DNS Dashboard, click vào record A, bật Proxy (☁️ Orange).

### 13.4 Cert Let's Encrypt không renew được

```bash
certbot renew --dry-run
# Đọc error message

# Nguyên nhân thường: port 80 bị block bởi iptables
# Nếu dùng HTTP challenge, cần mở port 80 tạm thời
iptables -I INPUT -p tcp --dport 80 -j ACCEPT
certbot renew
iptables -D INPUT -p tcp --dport 80 -j ACCEPT

# Hoặc đổi sang DNS challenge vĩnh viễn:
certbot certonly --manual --preferred-challenges dns \
  --manual-auth-hook /etc/letsencrypt/renewal-hooks/authenticator.sh \
  -d yourdomain.com
```

### 13.5 Cloudflare 524 — A Timeout Occurred

**Nguyên nhân**: Cloudflare đợi response từ VPS quá 100 giây.

```bash
# Kiểm tra app có chạy không
systemctl status docker  # hoặc service bạn dùng
docker ps

# Kiểm tra Nginx có respond không
curl -I http://localhost:80

# Nếu app slow, tăng proxy timeout trong Nginx:
# proxy_read_timeout 300s;
# proxy_connect_timeout 300s;
```

### 13.6 "Error 1020: Access Denied" — WAF Block

**Nguyên nhân**: WAF custom rule hoặc firewall rule block request của bạn.

**Debug**:
1. Cloudflare Dashboard → **Security → Events** → xem log
2. Tìm request bị block, xem rule nào trigger
3. Tạm tắt rule đó hoặc thêm exception

### 13.7 IP VPS vẫn bị tìm thấy qua historical DNS

Dùng [SecurityTrails](https://securitytrails.com) hoặc [ViewDNS.info](https://viewdns.info) để kiểm tra. Nếu IP cũ bị leak:

1. **Cách A**: Đổi sang Floating IP mới (không có lịch sử DNS).
2. **Cách B**: Dùng **Cloudflare Tunnel** — IP VPS sẽ không bao giờ xuất hiện trong DNS.
3. **Cách C**: Thay VPS mới và cấu hình lại.

---

## 14. Cấu Hình Nginx Hoàn Chỉnh (Production Template)

```nginx
# /etc/nginx/sites-available/yourdomain.com

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com staging.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL — Chọn 1 trong 2:
    # Option A: Let's Encrypt
    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    # Option B: Cloudflare Origin Cert
    # ssl_certificate     /etc/nginx/ssl/origin.pem;
    # ssl_certificate_key /etc/nginx/ssl/origin.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Lấy IP thật từ Cloudflare (không phải IP của CF proxy)
    # Phải include file này để $remote_addr = IP client thật
    include /etc/nginx/cloudflare-ips.conf;

    real_ip_header CF-Connecting-IP;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static files
    location /static/ {
        alias /app/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
    }

    # Frontend
    location / {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

server {
    listen 443 ssl http2;
    server_name staging.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Staging: Restrict access bằng Basic Auth hoặc IP whitelist
    # allow <YOUR_OFFICE_IP>;
    # deny all;

    location / {
        proxy_pass http://127.0.0.1:3001;  # staging app port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
    }
}
```

**File Cloudflare IP ranges** (để `real_ip_header` hoạt động đúng):

```bash
# Tạo file /etc/nginx/cloudflare-ips.conf
cat > /etc/nginx/cloudflare-ips.conf << 'EOF'
# Cloudflare IPv4 ranges - cập nhật tại https://www.cloudflare.com/ips-v4/
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
# Cloudflare IPv6 ranges
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;
EOF
```

---

## 15. Script Cập Nhật Cloudflare IP Ranges Tự Động

Cloudflare đôi khi thay đổi IP ranges. Script này tự cập nhật file iptables và Nginx mỗi tuần:

```bash
#!/bin/bash
# /usr/local/bin/update-cloudflare-ips.sh

set -e

CF_IPV4=$(curl -s https://www.cloudflare.com/ips-v4)
CF_IPV6=$(curl -s https://www.cloudflare.com/ips-v6)

# Update Nginx file
echo "# Auto-generated $(date)" > /etc/nginx/cloudflare-ips.conf
for ip in $CF_IPV4 $CF_IPV6; do
    echo "set_real_ip_from $ip;" >> /etc/nginx/cloudflare-ips.conf
done
echo "real_ip_header CF-Connecting-IP;" >> /etc/nginx/cloudflare-ips.conf

# Update iptables — xóa rules cũ, thêm mới
# (Chạy setup-firewall.sh sẽ tự gọi logic này)
iptables -F CLOUDFLARE_IN 2>/dev/null || iptables -N CLOUDFLARE_IN

for ip in $CF_IPV4; do
    iptables -A CLOUDFLARE_IN -s "$ip" -j ACCEPT
done

nginx -t && systemctl reload nginx
echo "Cloudflare IPs updated: $(date)"
```

```bash
# Cài vào crontab — chạy mỗi Chủ nhật 2 giờ sáng
chmod +x /usr/local/bin/update-cloudflare-ips.sh
echo "0 2 * * 0 root /usr/local/bin/update-cloudflare-ips.sh >> /var/log/cf-ips-update.log 2>&1" > /etc/cron.d/update-cloudflare-ips
```
