#!/bin/bash
# Prepare local Host dependency links for build and typecheck.
# DSH_CHECKOUT selects Host declarations; compiler and bundler are workspace-local.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="$ROOT/packages/dsh-right-sidebar"
cd "$ROOT"

CHECKOUT="${DSH_CHECKOUT:?set DSH_CHECKOUT to the selected Harness checkout}"
if [ ! -d "$CHECKOUT/packages" ]; then
  echo "build: invalid Harness checkout: $CHECKOUT" >&2
  exit 1
fi

TSC="$ROOT/node_modules/typescript/bin/tsc"
TSDOWN="$ROOT/node_modules/tsdown/dist/run.mjs"
if [ ! -f "$TSC" ] || [ ! -f "$TSDOWN" ]; then
  echo "build: install this workspace's development dependencies first" >&2
  exit 1
fi

link_pkg() {
  local target="$CHECKOUT/$2"
  if [ ! -e "$target" ]; then
    echo "build: dependency target missing: $target" >&2
    exit 1
  fi
  node -e "
    const fs = require('fs');
    const path = require('path');
    const link = path.resolve(process.argv[1]);
    const target = path.resolve(process.argv[2]);
    fs.rmSync(link, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');
  " "node_modules/$1" "$target"
}

if [ -L "$ROOT/node_modules" ] || [ -L "$ROOT/node_modules/@deepseek-ai" ]; then
  echo 'build: use independent dependency directories, not shared directory symlinks' >&2
  exit 1
fi

echo "=== Linking build dependencies (checkout: $CHECKOUT) ==="
mkdir -p node_modules/@deepseek-ai
node -e "const fs=require('fs');fs.rmSync('node_modules/@standard-schema',{recursive:true,force:true})"
link_pkg @deepseek-ai/cordis vendor/cordis
link_pkg @deepseek-ai/dsh-client-ui-slots packages/client/ui-slots
link_pkg @deepseek-ai/dsh-client-ui-renderer packages/client/ui-renderer
link_pkg @deepseek-ai/dsh-client-ui-layout packages/client/ui-layout
link_pkg @deepseek-ai/dsh-client-locale packages/client/locale

STD_SCHEMA=$(find "$CHECKOUT/node_modules/.pnpm" -maxdepth 1 -type d -iname '@standard-schema+spec@*' 2>/dev/null | head -1)
if [ -n "$STD_SCHEMA" ]; then
  node -e "
    const fs = require('fs');
    const path = require('path');
    fs.rmSync('node_modules/@standard-schema', { recursive: true, force: true });
    fs.mkdirSync('node_modules/@standard-schema', { recursive: true });
    fs.symlinkSync(path.resolve(process.argv[1]), path.resolve('node_modules/@standard-schema/spec'), process.platform === 'win32' ? 'junction' : 'dir');
  " "$STD_SCHEMA/node_modules/@standard-schema/spec"
fi
