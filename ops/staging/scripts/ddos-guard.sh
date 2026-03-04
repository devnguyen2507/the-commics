#!/bin/bash
set -euo pipefail

# Script đọc log Nginx và tự ban những IP vã HTTP quá 200 request / 1 phút.
# Đảm bảo Cloudflare Forwarded IP được log dưới format đúng (access.log).

LOG_FILE="/var/log/nginx/access.log"
THRESHOLD=200
TELEGRAM_TOKEN=${TELEGRAM_TOKEN:-""}   # Optional để báo Bot
CHAT_ID=${CHAT_ID:-""}

if [ ! -f "$LOG_FILE" ]; then
    echo "Log file $LOG_FILE không tồn tại, bỏ qua."
    exit 0
fi

# Rút thời gian phút hiện tại theo định dạng log nginx (vidu: 03/Mar/2026:10:15)
MINUTE=$(date +'%d/%b/%Y:%H:%M')

# awk quét dòng log theo phút hiện hành -> Lấy IP (cột 1) -> Sắp xếp đếm
ATTACKERS=$(awk -v d="$MINUTE" '$0 ~ d {print $1}' "$LOG_FILE" \
    | sort | uniq -c | sort -rn | awk -v t="$THRESHOLD" '$1 > t {print $2}')

for IP in $ATTACKERS; do
    # Bỏ qua IPv6 hoặc loopback (tạm thời cơ bản)
    if [[ "$IP" == "127.0.0.1" ]]; then continue; fi

    # Nếu IP chưa bị Block ở UFW hoặc IPTables
    if ! iptables -C INPUT -s "$IP" -j DROP 2>/dev/null; then
        echo "🚨 Phát hiện IP: $IP vượt quá $THRESHOLD req/min. Đang BLOCK..."
        
        # Block bằng Iptables
        iptables -I INPUT 1 -s "$IP" -j DROP

        # Alert Telegram (Nếu có biến)
        if [ -n "$TELEGRAM_TOKEN" ] && [ -n "$CHAT_ID" ]; then
            COUNT=$(awk -v d="$MINUTE" -v ip="$IP" '$0 ~ d && $1 == ip {c++} END {print c}' "$LOG_FILE")
            MSG="🛡️ *AUTO-BLOCKED DDoS*%0AIP: $IP%0ARequests/min: $COUNT%0ATime: $(date)"
            curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage" \
                -d "chat_id=$CHAT_ID&text=$MSG&parse_mode=Markdown" > /dev/null
        fi
    fi
done
