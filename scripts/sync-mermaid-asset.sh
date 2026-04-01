#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_FILE="$ROOT_DIR/node_modules/mermaid/dist/mermaid.min.js"
TARGET_FILE="$ROOT_DIR/plugins/honkit-plugin-local-mermaid/assets/mermaid.min.js"

if [[ ! -f "$SOURCE_FILE" ]]; then
  printf 'Mermaid asset not found: %s\n' "$SOURCE_FILE" >&2
  exit 1
fi

cp "$SOURCE_FILE" "$TARGET_FILE"
printf 'Synced Mermaid runtime to %s\n' "$TARGET_FILE"
