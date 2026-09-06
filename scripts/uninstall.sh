#!/usr/bin/env bash
# Remove the bundle and reverse only the exact Host patch recorded by setup.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="$REPO_DIR/packages/dsh-right-sidebar"
PROFILE="${DSH_PROFILE:?set DSH_PROFILE to the selected profile}"
PROFILE_HOME="${DSH_HOME:?set DSH_HOME to the selected Home}"
CHECKOUT="${DSH_CHECKOUT:?set DSH_CHECKOUT to the selected Harness checkout}"
MODE="${1:---check}"
if [ "$MODE" != "--check" ] && [ "$MODE" != "--remove" ]; then
  echo "usage: bash scripts/uninstall.sh [--check|--remove]" >&2
  exit 2
fi
if [ ! -f "$CHECKOUT/package.json" ] || ! git -C "$CHECKOUT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "invalid DSH_CHECKOUT: $CHECKOUT" >&2
  exit 1
fi
run_plugin() {
  pnpm --dir "$CHECKOUT" dsh plugin --profile "$PROFILE" "$@"
}

PATCH="$PACKAGE_DIR/patches/deepseek-harness.patch"
if [ ! -f "$PATCH" ]; then
  echo "uninstall: tracked harness patch is missing: $PATCH" >&2
  exit 1
fi
PATCH_SHA="$(sha256sum "$PATCH" | awk '{print $1}')"
STATE_FILE="$(git -C "$CHECKOUT" rev-parse --git-path dsh-right-sidebar.patch-state)"
if [[ "$STATE_FILE" != /* ]]; then STATE_FILE="$CHECKOUT/$STATE_FILE"; fi
RECORDED_SHA=""
RECORDED_OWNED=""
if [ -f "$STATE_FILE" ]; then
  RECORDED_SHA="$(sed -n 's/^patch_sha256=//p' "$STATE_FILE")"
  RECORDED_OWNED="$(sed -n 's/^patch_applied_by_setup=//p' "$STATE_FILE")"
fi

regenerate_shared_catalogs() {
  echo "regenerating shared client catalogs from the remaining source contributions..."
  (cd "$CHECKOUT" && pnpm run gen-client-catalog && pnpm run gen-cordis-api)
}

rebuild_modified_host() {
  echo "rebuilding modified Host libraries and Web frontend..."
  (cd "$CHECKOUT" && pnpm exec tsc -b \
    packages/client/store/tsconfig.json \
    packages/client/ui-slots/tsconfig.json \
    packages/client/ui-layout/tsconfig.json \
    packages/client/ui-conversation/tsconfig.json \
    packages/client/web/tsconfig.json)
  (cd "$CHECKOUT" && pnpm --filter @deepseek-ai/dsh-client-store exec tsdown)
  (cd "$CHECKOUT" && pnpm --filter @deepseek-ai/dsh-client-ui-slots exec tsdown)
  (cd "$CHECKOUT" && pnpm --filter @deepseek-ai/dsh-client-ui-layout bundle)
  (cd "$CHECKOUT" && pnpm --filter @deepseek-ai/dsh-client-ui-conversation bundle)
  (cd "$CHECKOUT" && pnpm --filter @deepseek-ai/dsh-client-ui-primitives exec tsdown)
  (cd "$CHECKOUT" && pnpm --filter @deepseek-ai/dsh-client-web exec tsdown)
  (cd "$CHECKOUT" && pnpm run build:web)
}

if [ "$MODE" = "--check" ]; then
  echo "uninstall: selected profile is $PROFILE_HOME/profiles/$PROFILE"
  echo "uninstall: recorded Host ownership=$RECORDED_OWNED digest=$RECORDED_SHA"
  run_plugin why @dsh-external/dsh-right-sidebar
  exit 0
fi

node "$REPO_DIR/scripts/check-consumers.mjs" "$PROFILE_HOME/profiles/$PROFILE"

if [ "$RECORDED_SHA" != "$PATCH_SHA" ]; then
  echo "uninstall: no matching setup provenance; preserving Host files" >&2
  echo "uninstall: run setup from this exact plugin revision before uninstalling its patch" >&2
elif [ "$RECORDED_OWNED" != "true" ]; then
  echo "uninstall: the matching patch predated setup; preserving Host files"
  rm -f "$STATE_FILE"
elif git -C "$CHECKOUT" apply --unidiff-zero --check --reverse "$PATCH" 2>/dev/null; then
  echo "rolling back the exact recorded harness patch..."
  git -C "$CHECKOUT" apply --unidiff-zero --reverse "$PATCH"
  regenerate_shared_catalogs
  rm -f "$STATE_FILE"
  rebuild_modified_host
else
  echo "uninstall: recorded patch no longer reverses cleanly; preserving Host files" >&2
  echo "uninstall: resolve overlapping edits before retrying" >&2
fi

run_plugin remove @dsh-external/dsh-right-sidebar

echo "uninstall: sidebar package removed; verify the selected profile before separate activation"
