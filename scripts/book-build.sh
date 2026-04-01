#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/_book}"

cd "$ROOT_DIR"
bash ./scripts/sync-mermaid-asset.sh
rm -rf "$OUTPUT_DIR"
npx honkit build . "$OUTPUT_DIR"

printf 'HTML book built at %s\n' "$OUTPUT_DIR"
