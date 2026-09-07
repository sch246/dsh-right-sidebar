#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/prepare-build.sh"
cd "$PACKAGE_DIR"
echo "=== Compiling src → lib ==="
node -e "require('fs').rmSync('lib', { recursive: true, force: true })"
node "$TSC" -p tsconfig.json
node "$TSC" -p tsconfig.client.json --emitDeclarationOnly
node "$TSDOWN" --config tsdown.config.ts
echo "=== Build complete ==="
