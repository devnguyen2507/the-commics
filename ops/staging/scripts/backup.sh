#!/bin/bash
set -euo pipefail

# Daily backup script cho PostgreSQL và Redis ở Staging.

BACKUP_DIR="/backup/commics/$(date +%Y%m%d)"
RETENTION_DAYS=7 # Lưu lượng cache staging ngắn (production set 30)

mkdir -p "$BACKUP_DIR"

echo "Bắt đầu Export Database Staging..."
# 1. Backup PostgreSQL
if docker ps | grep -q "postgres"; then
    docker exec $(docker ps -aqf "name=staging-db-1") pg_dump -U commics -Fc commics_db \
        | gzip > "$BACKUP_DIR/db.sql.gz"
fi

# 2. Backup Redis
if docker ps | grep -q "redis"; then
    docker exec $(docker ps -aqf "name=staging-redis-1") redis-cli BGSAVE
    # Chờ bgsave write vào disk
    sleep 3
    docker cp $(docker ps -aqf "name=staging-redis-1"):/data/dump.rdb "$BACKUP_DIR/redis.rdb"
fi

# 3. Nén các Config nhạy cảm
tar czf "$BACKUP_DIR/configs.tar.gz" \
  /opt/commics/ops/staging/.env* \
  /opt/commics/ops/staging/docker-compose.yml \
  /etc/nginx/conf.d/ 2>/dev/null || true

# 4. Gọn dọn dẹp các backup cũ hơn RETENTION_DAYS
find /backup/commics -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

echo "✅ Backup hoàn tất. File lưu tại: $BACKUP_DIR"
