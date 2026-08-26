#!/usr/bin/env bash
# Remove the bundle and reverse only the exact Host patch recorded by setup.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${DSH_PROFILE:-web}"
CHECKOUT="${DSH_CHECKOUT:-}"
for CANDIDATE in "$CHECKOUT" /root/deepseek-harness "$HOME/deepseek-harness"; do
  if [ -n "$CANDIDATE" ] && [ -d "$CANDIDATE/packages" ]; then
    CHECKOUT="$CANDIDATE"
    break
  fi
done
if [ -z "${CHECKOUT:-}" ] || [ ! -d "$CHECKOUT/packages" ]; then
  echo "uninstall: cannot locate the dsh checkout (set DSH_CHECKOUT)" >&2
  exit 1
fi

PATCH="$REPO_DIR/patches/deepseek-harness.patch"
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

if [ "$RECORDED_SHA" != "$PATCH_SHA" ]; then
  echo "uninstall: no matching setup provenance; preserving Host files" >&2
  echo "uninstall: run setup from this exact plugin revision before uninstalling its patch" >&2
elif [ "$RECORDED_OWNED" != "true" ]; then
  echo "uninstall: the matching patch predated setup; preserving Host files"
  rm -f "$STATE_FILE"
elif git -C "$CHECKOUT" apply --check --reverse "$PATCH" 2>/dev/null; then
  echo "rolling back the exact recorded harness patch..."
  git -C "$CHECKOUT" apply --reverse "$PATCH"
  regenerate_shared_catalogs
  rm -f "$STATE_FILE"
  echo "rebuilding modified Host bundles..."
  (cd "$CHECKOUT" && pnpm --filter @deepseek-ai/dsh-client-ui-layout bundle)
  (cd "$CHECKOUT" && pnpm --filter @deepseek-ai/dsh-client-ui-conversation bundle)
else
  echo "uninstall: recorded patch no longer reverses cleanly; preserving Host files" >&2
  echo "uninstall: resolve overlapping edits before retrying" >&2
fi

CHECKOUT_CLI="$CHECKOUT/apps/cli/lib/bin.js"
if command -v dsh >/dev/null 2>&1; then
  (cd "$REPO_DIR" && dsh plugin --profile "$PROFILE" remove @dsh-external/dsh-right-sidebar) \
    || echo "uninstall: dsh plugin remove failed; remove @dsh-external/dsh-right-sidebar manually"
elif command -v node >/dev/null 2>&1 && [ -f "$CHECKOUT_CLI" ]; then
  (cd "$REPO_DIR" && node "$CHECKOUT_CLI" plugin --profile "$PROFILE" remove @dsh-external/dsh-right-sidebar) \
    || echo "uninstall: checkout CLI remove failed; remove @dsh-external/dsh-right-sidebar manually"
elif command -v pnpm >/dev/null 2>&1; then
  (cd "$REPO_DIR" && pnpm --dir "$CHECKOUT" dsh plugin --profile "$PROFILE" remove @dsh-external/dsh-right-sidebar) \
    || echo "uninstall: checkout CLI remove failed; remove @dsh-external/dsh-right-sidebar manually"
else
  echo "neither dsh nor pnpm is available; remove @dsh-external/dsh-right-sidebar manually"
fi

echo "uninstall complete. Restart dsh web."
