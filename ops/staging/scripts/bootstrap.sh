#!/bin/bash
set -euo pipefail

# Script chạy duy nhất 1 lần để dựng Server Staging từ con số 0.
# Yêu cầu: Đã clone code về /opt/commics, đã tạo file /opt/commics/ops/staging/.env.staging

echo "🚀 Bắt đầu Bootstrap Staging Server..."

# 1. Cập nhật hệ thống và cài đặt Dependencies
echo "1️⃣ Cập nhật hệ thống..."
apt-get update && apt-get upgrade -y
apt-get install -y apt-transport-https ca-certificates curl software-properties-common ufw nginx jq awscli

# 2. Cài đặt Docker
if ! command -v docker &> /dev/null; then
    echo "2️⃣ Cài đặt Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# 3. Set up quyền thư mục log và run cho Docker
mkdir -p /var/log/commics
chown -R 1000:1000 /var/log/commics

# 4. Cấu hình Nginx
echo "4️⃣ Cấu hình Nginx Reverse Proxy..."
cp /opt/commics/ops/staging/nginx/nginx.conf /etc/nginx/nginx.conf
cp /opt/commics/ops/staging/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Xóa cấu hình default nginx cũ
rm -f /etc/nginx/sites-enabled/default

systemctl restart nginx
systemctl enable nginx

# 5. Cấu hình Iptables / Firewall (Cloudflare Only)
echo "5️⃣ Chạy Firewall Script..."
chmod +x /opt/commics/ops/staging/scripts/setup-firewall.sh
/opt/commics/ops/staging/scripts/setup-firewall.sh

# 6. Khởi chạy Services Docker
echo "6️⃣ Build và Start các services Commics..."
cd /opt/commics/ops/staging

# Kiểm tra file env
if [ ! -f ".env.staging" ]; then
    echo "❌ LỖI: Không tìm thấy file .env.staging! Vui lòng copy từ .env.staging.example và cấu hình trước."
    exit 1
fi

docker compose up -d --build

echo "✅ Bootstrap Staging thành công! Hãy kiểm tra domain của bạn."
