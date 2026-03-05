#!/bin/bash

# Script setup Firewall (UFW) cho Production VPS
# Mục tiêu: Chặn tất cả các port ngoại trừ Web (80, 443) và SSH (22)

# Đảm bảo lệnh chạy với quyền sudo
if [ "$EUID" -ne 0 ]; then 
  echo "Vui lòng chạy script này với quyền sudo (sudo bash setup-firewall.sh)"
  exit 1
fi

echo "--- Đang cấu hình Firewall (UFW) ---"

# Cài đặt UFW và fail2ban
apt-get update && apt-get install -y ufw fail2ban

# Cấu hình fail2ban cơ bản cho SSH
cat <<EOF > /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

systemctl restart fail2ban

# Thiết lập mặc định: Chặn vào, Cho phép ra
ufw default deny incoming
ufw default allow outgoing

# Mở các cổng cần thiết
echo "[+] Đang mở cổng SSH (22)..."
ufw allow 22/tcp

echo "[+] Đang mở cổng HTTP (80)..."
ufw allow 80/tcp

echo "[+] Đang mở cổng HTTPS (443)..."
ufw allow 443/tcp

# Kích hoạt UFW (dùng --force để không hỏi xác nhận)
echo "[+] Đang kích hoạt UFW..."
ufw --force enable

echo "--- Hoàn tất! Trạng thái Firewall hiện tại: ---"
ufw status numbered

echo "QUAN TRỌNG: Các ứng dụng chạy chế độ 'network_mode: host' hiện đã được bảo vệ."
echo "Hacker chỉ có thể quét thấy cổng 22, 80, 443 từ bên ngoài."
