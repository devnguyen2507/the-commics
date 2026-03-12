#!/bin/sh

# Database migration runner script
# This script applies SQL migrations from src/backend/crawler/migrations
# It uses docker-db-1 container to execute psql.

set -e

# Determine the directory of the script
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
PROJECT_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

DB_CONTAINER="docker-db-1"
DB_USER="commics"
DB_NAME="commics"
MIGRATIONS_DIR="$PROJECT_ROOT/src/backend/crawler/migrations"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${BLUE}Starting migrations...${NC}"

# Check if DB container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo "Error: Database container $DB_CONTAINER is not running."
    exit 1
fi

# Create schema_migrations table if not exists
echo "Checking tracking table..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);" > /dev/null

# Get list of migration folders sorted
MIGRATIONS=$(ls -d "$MIGRATIONS_DIR"/*/ | sort)

for migration_path in $MIGRATIONS; do
    MIGRATION_NAME=$(basename "$migration_path")
    
    # Check if migration was already applied
    ALREADY_RUN=$(docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1 FROM schema_migrations WHERE version = '$MIGRATION_NAME';")
    
    if [ "$(echo "$ALREADY_RUN" | xargs)" = "1" ]; then
        echo "Skipping ${YELLOW}$MIGRATION_NAME${NC} (already applied)"
    else
        echo "Applying ${GREEN}$MIGRATION_NAME${NC}..."
        
        UP_SQL="$migration_path/up.sql"
        if [ -f "$UP_SQL" ]; then
            # Run migration in a transaction
            docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$UP_SQL"
            
            # Record migration as applied
            docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO schema_migrations (version) VALUES ('$MIGRATION_NAME');" > /dev/null
            
            echo "Successfully applied $MIGRATION_NAME"
        else
            echo "Warning: No up.sql found in $migration_path"
        fi
    fi
done

echo "${GREEN}All migrations completed successfully!${NC}"
