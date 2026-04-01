#!/usr/bin/env bash

set -euo pipefail

FORMAT="${1:-}"

if [[ -z "$FORMAT" ]]; then
  printf 'Usage: %s <pdf|epub|mobi>\n' "$0" >&2
  exit 1
fi

case "$FORMAT" in
  pdf|epub|mobi)
    ;;
  *)
    printf 'Unsupported format: %s\n' "$FORMAT" >&2
    exit 1
    ;;
esac

if ! command -v ebook-convert >/dev/null 2>&1; then
  printf 'Missing dependency: ebook-convert. Install Calibre before exporting %s files.\n' "$FORMAT" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
OUTPUT_FILE="$DIST_DIR/anthropic-src-gitbook.$FORMAT"

mkdir -p "$DIST_DIR"
cd "$ROOT_DIR"
bash ./scripts/sync-mermaid-asset.sh
npx honkit "$FORMAT" . "$OUTPUT_FILE"

printf 'Exported %s book to %s\n' "$FORMAT" "$OUTPUT_FILE"
