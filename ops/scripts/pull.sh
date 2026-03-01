#!/bin/bash

# Usage: ./pull.sh <comic-slug> [force_img]
#        ./pull.sh list
# Example: ./pull.sh em-hua-se-giu-bi-mat
#          ./pull.sh list

# Get script directory to handle relative paths correctly
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TMP_LIST="$PROJECT_ROOT/tmp/list.txt"

mkdir -p "$PROJECT_ROOT/tmp"

if [ -z "$1" ]; then
    echo "Usage: ./pull.sh <comic-slug> [true|false]"
    echo "       ./pull.sh list"
    echo "       ./pull.sh all [true|false]"
    exit 1
fi

if [ "$1" == "all" ]; then
    ONLY_IMG=$2
    if [ -z "$ONLY_IMG" ]; then
        ONLY_IMG="false"
    fi
    echo "Triggering bulk sync for ALL comics (only_img=$ONLY_IMG)..."
    # Ensure helper scripts are in container
    docker cp "$PROJECT_ROOT/src/backend/crawler/scripts/bulk_sync_trigger.py" commics-crawler:/app/scripts/bulk_sync_trigger.py
    docker exec -it commics-crawler bash -c "export PYTHONPATH=/app && python scripts/bulk_sync_trigger.py $ONLY_IMG"
    exit 0
fi

if [ "$1" == "list" ]; then
    if [ ! -f "$TMP_LIST" ]; then
        echo "Fetching comic list from database..."
        # Ensure helper script is in container
        docker cp "$PROJECT_ROOT/src/backend/crawler/scripts/list_comics.py" commics-crawler:/app/scripts/list_comics.py
        # Run and save
        docker exec -it commics-crawler bash -c "export PYTHONPATH=/app && python scripts/list_comics.py" > "$TMP_LIST"
    fi
    echo "--- Available Comic IDs (Slugs) ---"
    cat "$TMP_LIST"
    echo "-----------------------------------"
    echo "Usage: ./pull.sh <slug>"
    exit 0
fi

SLUG=$1
ONLY_IMG=$2

if [ -z "$ONLY_IMG" ]; then
    ONLY_IMG="false"
fi

echo "Targeting comic slug: $SLUG (only_img=$ONLY_IMG)"

# Copy the trigger script to the container
docker cp "$PROJECT_ROOT/src/backend/crawler/scripts/pull_trigger.py" commics-crawler:/app/scripts/pull_trigger.py

# Execute the trigger inside the container
docker exec -it commics-crawler bash -c "export PYTHONPATH=/app && python scripts/pull_trigger.py $SLUG $ONLY_IMG"
