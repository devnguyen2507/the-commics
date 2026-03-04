# Commics Staging Deployment & Operations Guide

Thư mục này chứa toàn bộ cấu hình, script và hướng dẫn để triển khai hệ thống Commics lên môi trường Staging (VPS Ubuntu/Debian). Hạ tầng được thiết kế với tiêu chí:
1. **Security-First**: Ẩn IP qua Cloudflare, chặn mọi traffic không qua proxy, áp dụng Container Hardening (Non-root, Read-only).
2. **1-Click Launch**: Sử dụng script bootstrap để dựng server từ số 0.
3. **Dễ bảo trì**: Tự động hóa backup qua cronjob, tích hợp script phòng chống DDoS.

---

## 🏗 Cấu Trúc Thư Mục

```text
ops/staging/
├── README.md               # Tài liệu bạn đang đọc
├── docker-compose.yml      # Cấu hình container orchestration (Hardened)
├── .env.staging.example    # File biến môi trường mẫu
├── nginx/                  # Cấu hình Nginx Reverse Proxy
│   ├── nginx.conf          # Định nghĩa log format, rate limit zone
│   └── conf.d/default.conf # Virtual host, proxy pass vào 127.0.0.1
└── scripts/                # Automations
    ├── bootstrap.sh        # Chạy 1 lần duy nhất để cài đặt Server mới
    ├── setup-firewall.sh   # Cấu hình iptables chỉ nhận IP từ Cloudflare
    ├── backup.sh           # Script backup DB & Redis (để set cronjob)
    └── ddos-guard.sh       # Script đọc Nginx access log để auto block IP
```

---

## 🚀 Hướng Dẫn Triển Khai (Setup từ con số 0)

Bạn vừa mua 1 con VPS trắng cài Ubuntu 22.04/24.04 (vd: Hetzner CX21). Hãy làm theo các bước sau:

### Bước 1: Trỏ Domain và Bật Cloudflare Proxy
Trước khi đụng vào VPS, hãy bảo vệ nó ngay từ đầu.
1. Đăng nhập Cloudflare, vào phần DNS của domain (vd: `staging.commics.com`).
2. Trỏ A Record về `IP_CỦA_VPS`.
3. Bật **Orange Cloud ☁️ (Proxy status: Proxied)**.
4. Chuyển sang Tab **SSL/TLS**. Chỉnh chế độ thành **Full (Strict)**.

### Bước 2: Đẩy Code & Cấu hình môi trường
SSH vào VPS bằng quyền root:

```bash
# Clone source code
git clone https://github.com/devnguyen2507/the-commics.git /opt/commics
cd /opt/commics

# Tạo file .env
cp ops/staging/.env.staging.example ops/staging/.env.staging
nano ops/staging/.env.staging
```
*Điền đầy đủ các thông tin: DATABASE_URL, REDIS_URL, SITE_URL (vd: `https://staging.commics.com`).*

### Bước 3: Chạy Bootstrap Script
Script này sẽ tự động: cài Docker, cài Nginx Host, copy cấu hình Nginx, setup ufw/iptables chặn IP ngoài, và start docker-compose.

```bash
cd /opt/commics/ops/staging/scripts
chmod +x *.sh
./bootstrap.sh
```

### Bước 4: Thiết lập Cronjob cho Backup và Anti-DDoS
Mở trình quản lý cron:
```bash
crontab -e
```
Thêm 2 dòng sau vào cuối:
```text
# Backup DB hàng ngày vào 3AM
0 3 * * * /opt/commics/ops/staging/scripts/backup.sh >> /var/log/commics_backup.log 2>&1

# Block DDoS IPs mỗi phút
* * * * * /opt/commics/ops/staging/scripts/ddos-guard.sh >> /var/log/commics_ddos_guard.log 2>&1
```

---

## 🛡 Cloudflare Edge Security (Khuyến nghị)
Thay vì xử lý Security Headers ở server, hãy làm nó trên Cloudflare để giảm tải.
1. Vào **Rules** -> **Transform Rules** -> **Modify Response Header**.
2. Tạo rule áp dụng cho `(http.host eq "staging.commics.com")`.
3. Thêm các Header tĩnh:
   - `Set static`: `X-Frame-Options` = `DENY` (hoặc `SAMEORIGIN`)
   - `Set static`: `X-Content-Type-Options` = `nosniff`
   - `Set static`: `Referrer-Policy` = `strict-origin-when-cross-origin`

---

## 🔒 Ghi Chú Kỹ Thuật (Cho DevOps/SysAdmin)

#### Tại sao `docker-compose.yml` lại map port `127.0.0.1:3001`?
Docker mặc định sẽ chèn một rule bypass ufw/iptables nếu bạn publish port dạng `3001:3001` ra network `0.0.0.0`. Gắn vào localhost `127.0.0.1` nghĩa là không ai từ mạng ngoài chạm được vào container, chỉ có tệp `nginx.conf` chạy trên chính máy host mới proxy pass traffic vào được.

#### Tại sao phải chạy container dưới quyền `user: "1000"` và ổ đĩa `read_only`?
Đây là tiêu chuẩn bảo mật lấy từ Kubernetes Pod Security. Nếu chẳng may ứng dụng dính lỗi Remote Code Execution (RCE), hacker cũng:
- Không có quyền root (do chạy uid 1000).
- Không thể tải hoặc ghi shell payload xuống đĩa (do `read_only: true`). Chỉ thư mục `/tmp` được ghi tạm trên RAM (`tmpfs`).
