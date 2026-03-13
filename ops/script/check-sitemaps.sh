#!/bin/bash

# Sitemap Comparison Script
# Orchestrates building the site, fetching production data, and running the audit.

set -e

# Configuration
PROD_BASE_URL="https://fanmanga.net"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_DIR="$PROJECT_ROOT/ops/script"
TMP_DIR="$SCRIPT_DIR/tmp"
LOCAL_SITEMAP_DIR="$PROJECT_ROOT/src/ui/dist/client"

echo "=== Starting Sitemap Verification Workflow ==="

# 1. Setup TMP directory
echo "[1/4] Preparing temporary directory: $TMP_DIR"
mkdir -p "$TMP_DIR"

# 2. Build local site
echo "[2/4] Building static site (npm run build:static)..."
npm run build:static --prefix "$PROJECT_ROOT/src/ui"

# 3. Fetch production sitemaps
echo "[3/4] Fetching production sitemaps from $PROD_BASE_URL..."
SITEMAPS=("sitemap-index.xml" "sitemap-page.xml" "sitemap-comics.xml" "sitemap-categories.xml" "sitemap-chapters.xml")

for sitemap in "${SITEMAPS[@]}"; do
    echo "  - Downloading $sitemap..."
    curl -s "$PROD_BASE_URL/$sitemap" -o "$TMP_DIR/prod-$sitemap"
done

# 4. Run Comparison
echo "[4/4] Running comparison analysis..."
# We use node to run the JS logic, ensuring fast-xml-parser is available in src/ui/node_modules
# or we can try to find it.
NODE_PATH="$PROJECT_ROOT/src/ui/node_modules" node "$SCRIPT_DIR/sitemap-comparer.cjs" "$TMP_DIR" "$LOCAL_SITEMAP_DIR"

echo "=== Sitemap Verification Complete ==="
echo "Artifacts preserved in $TMP_DIR"
