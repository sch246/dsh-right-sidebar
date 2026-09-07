#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/prepare-build.sh"
cd "$PACKAGE_DIR"
node "$TSC" -p tsconfig.json --noEmit
node "$TSC" -p tsconfig.client.json --noEmit
