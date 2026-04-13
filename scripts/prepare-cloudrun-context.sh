#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${1:-"$ROOT_DIR/.cloudrun-deploy-temp"}"

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR/server"

cp "$ROOT_DIR/Dockerfile" "$TARGET_DIR/"
cp "$ROOT_DIR/.dockerignore" "$TARGET_DIR/"
cp "$ROOT_DIR/package.json" "$TARGET_DIR/"
cp "$ROOT_DIR/package-lock.json" "$TARGET_DIR/"
rsync -a "$ROOT_DIR/server/" "$TARGET_DIR/server/"

echo "Prepared CloudRun deploy context at: $TARGET_DIR"
