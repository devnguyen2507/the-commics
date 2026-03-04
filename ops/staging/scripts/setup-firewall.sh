#!/bin/bash
# =======================================================
# CHỈ CHO PHÉP CLOUDFLARE XUYÊN QUA CỔNG 80/443
# Cloudflare proxy giấu IP gốc của VPS. Tuyệt đối không xóa rule này.
# =======================================================

echo "🛡 Cấu hình IPTables IPv4 cho Nginx..."

# Xóa các Rule cũ
iptables -F
iptables -X

# Luôn cho phép Loopback (rất quan trọng cho Nginx proxy -> 127.0.0.1)
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Cho phép các connection đã thiết lập
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Cho phép SSH mọi nơi (Hoặc cấu hình YOUR_IP tại đây để khóa SSH)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Mở cổng cho Cloudflare IPs (v4)
echo "Tải danh sách IP v4 của Cloudflare..."
curl -s https://www.cloudflare.com/ips-v4 | while read -r ip; do
    iptables -A INPUT -p tcp -s "$ip" --dport 80 -j ACCEPT
    iptables -A INPUT -p tcp -s "$ip" --dport 443 -j ACCEPT
done

# DROP tất cả HTTP/HTTPS không đến từ Cloudflare
iptables -A INPUT -p tcp --dport 80 -j DROP
iptables -A INPUT -p tcp --dport 443 -j DROP

# Save cấu hình để restore khi khởi động lại
iptables-save > /etc/iptables/rules.v4 || echo "Cảnh báo: Chưa cài iptables-persistent, rule có thể mất khi reboot"

echo "✅ Đã thiết lập IPTables thành công! Chỉ Cloudflare mới vào được port 80/443."
