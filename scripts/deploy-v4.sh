#!/usr/bin/env bash
# Build V4 (Eos) and publish dist-v4/ to the standalone GitHub Pages repo
# (sebastianvidalnbc/iceberg-v4-eos → main). The V4 source lives in the main
# repo (iceberg-tabs-prototype); the live site is a SEPARATE repo that only
# updates when the built output is pushed here. dist-v4/ has its own nested
# .git remote pointing at iceberg-v4-eos, so we commit + push from inside it.
#
# Usage: npm run deploy:v4  (optionally pass a commit message)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/dist-v4"
MSG="${1:-Deploy: $(date -u '+%Y-%m-%d %H:%M UTC')}"

echo "▸ Building V4…"
npm run --prefix "$ROOT" build:v4

if [ ! -d "$OUT/.git" ]; then
  echo "✗ $OUT is not wired to the iceberg-v4-eos remote (missing .git)." >&2
  echo "  Run once:  git -C \"$OUT\" init && git -C \"$OUT\" remote add origin https://github.com/sebastianvidalnbc/iceberg-v4-eos.git" >&2
  exit 1
fi

# GitHub Pages: disable Jekyll so /assets/ is served verbatim.
touch "$OUT/.nojekyll"

echo "▸ Publishing dist-v4/ → iceberg-v4-eos (main)…"
git -C "$OUT" add -A
if git -C "$OUT" diff --cached --quiet; then
  echo "▸ No build changes to deploy."
  exit 0
fi
git -C "$OUT" commit -q -m "$MSG"
git -C "$OUT" push origin HEAD:main

echo "✓ Deployed. Live in ~1–2 min: https://sebastianvidalnbc.github.io/iceberg-v4-eos/"
