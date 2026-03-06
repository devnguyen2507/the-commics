#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# deploy.sh — Build & Deploy UI lên Cloudflare Pages
# Usage: bash ops/scripts/deploy.sh
# ─────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
UI_DIR="$REPO_ROOT/src/ui"
DIST_DIR="$UI_DIR/dist/client"
CF_PROJECT="commics-ui"
BRANCH="${CF_BRANCH:-main}"

echo "╔══════════════════════════════════════════╗"
echo "║      Deploy UI → Cloudflare Pages        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ─── Step 1: Build static ─────────────────────
echo "▶ [1/2] Building static site..."
cd "$UI_DIR"
npm run build:static

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Build failed: '$DIST_DIR' not found."
  exit 1
fi

echo "✅ Build complete → $DIST_DIR"
echo ""

# ─── Step 2: Deploy to Cloudflare Pages ───────
echo "▶ [2/2] Deploying to Cloudflare Pages..."
echo "   Project : $CF_PROJECT"
echo "   Branch  : $BRANCH"
echo "   Folder  : $DIST_DIR"
echo ""

npx wrangler pages deploy "$DIST_DIR" \
  --project-name "$CF_PROJECT" \
  --branch "$BRANCH" \
  --commit-dirty=true

echo ""
echo "🎉 Done!"
