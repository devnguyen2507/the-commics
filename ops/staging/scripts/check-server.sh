#!/bin/bash

# Configuration
TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
CHAT_ID="YOUR_TELEGRAM_CHAT_ID"
HOSTNAME=$(hostname)
THRESHOLD_CPU=80
THRESHOLD_RAM=90

# Function to send Telegram message
send_telegram() {
    local message=$1
    curl -s -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
        -d chat_id="$CHAT_ID" \
        -d text="$message" \
        -d parse_mode="Markdown" > /dev/null
}

# 1. Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
if (( $(echo "$CPU_USAGE > $THRESHOLD_CPU" | bc -l) )); then
    send_telegram "⚠️ *ALARM: CPU High* on $HOSTNAME%0AUsage: $CPU_USAGE%"
fi

# 2. Check RAM usage
RAM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
if (( $(echo "$RAM_USAGE > $THRESHOLD_RAM" | bc -l) )); then
    send_telegram "⚠️ *ALARM: RAM High* on $HOSTNAME%0AUsage: $RAM_USAGE%"
fi

# 3. Check for high connections (Potential DDoS)
# Counts established connections to ports 80 and 443
CONNECTIONS=$(netstat -an | grep -E ':80|:443' | grep ESTABLISHED | wc -l)
if [ "$CONNECTIONS" -gt 500 ]; then
    send_telegram "🚨 *URGENT: High Connections Detected!* on $HOSTNAME%0AActive connections: $CONNECTIONS %0A_Potential DDoS attack in progress!_"
fi
