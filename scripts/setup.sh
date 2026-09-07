#!/usr/bin/env bash
# Install dsh-right-sidebar and record exact ownership of its Host intervention.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="$REPO_DIR/packages/dsh-right-sidebar"
PROFILE="${DSH_PROFILE:?set DSH_PROFILE to the selected profile}"
PROFILE_HOME="${DSH_HOME:?set DSH_HOME to the selected Home}"
CHECKOUT="${DSH_CHECKOUT:?set DSH_CHECKOUT to the selected Harness checkout}"
MODE="${1:---check}"
if [ "$MODE" != "--check" ] && [ "$MODE" != "--install" ]; then
  echo "usage: bash scripts/setup.sh [--check|--install]" >&2
  exit 2
fi
if [ ! -f "$CHECKOUT/package.json" ] || ! git -C "$CHECKOUT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "invalid DSH_CHECKOUT: $CHECKOUT" >&2
  exit 1
fi
run_dsh() {
  (cd "$CHECKOUT" && DSH_HOME="$PROFILE_HOME" node --import tsx/esm apps/cli/src/bin.ts "$@")
}

run_plugin() {
  run_dsh plugin --profile "$PROFILE" "$@"
}

PATCH="$PACKAGE_DIR/patches/deepseek-harness.patch"
if [ ! -f "$PATCH" ]; then
  echo "setup: tracked harness patch is missing: $PATCH" >&2
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
PATCH_APPLIED_BY_SETUP=false

verify_source_markers() {
  local needle='@meta-intent:begin dsh-right-sidebar '
  local paths=(
    packages/client/store/src/contract.ts
    packages/client/store/src/index.ts
    packages/client/ui-conversation/src/client/skeleton/ConversationRoot.module.css
    packages/client/ui-layout/src/client/AppFrame.module.css
    packages/client/ui-layout/src/client/AppFrame.tsx
    packages/client/ui-layout/src/client/columns.ts
    packages/client/ui-layout/src/client/index.ts
    packages/client/ui-layout/src/client/service.ts
    packages/client/ui-layout/src/client/stores.ts
    packages/client/ui-slots/src/store.ts
  )
  for path in "${paths[@]}"; do
    if ! grep -Fq "$needle" "$CHECKOUT/$path"; then
      echo "setup: ownership marker missing from $path" >&2
      return 1
    fi
  done
}

regenerate_shared_catalogs() {
  echo "regenerating shared client catalogs from all currently installed source contributions..."
  (cd "$CHECKOUT" && node --import tsx/esm scripts/gen-client-catalog.ts && node --import tsx/esm scripts/gen-cordis-api.ts)
}

rebuild_modified_host() {
  echo "rebuilding modified Host libraries and Web frontend..."
  (cd "$CHECKOUT" && node "$CHECKOUT/node_modules/typescript/bin/tsc" -b \
    packages/client/store/tsconfig.json \
    packages/client/ui-slots/tsconfig.json \
    packages/client/ui-layout/tsconfig.json \
    packages/client/ui-conversation/tsconfig.json \
    packages/client/web/tsconfig.json)
  (cd "$CHECKOUT/packages/client/store" && node "$CHECKOUT/node_modules/tsdown/dist/run.mjs" --config tsdown.config.ts)
  (cd "$CHECKOUT/packages/client/ui-slots" && node "$CHECKOUT/node_modules/tsdown/dist/run.mjs" --config tsdown.config.ts)
  (cd "$CHECKOUT/packages/client/ui-layout" && node "$CHECKOUT/node_modules/tsdown/dist/run.mjs" --config tsdown.config.ts)
  (cd "$CHECKOUT/packages/client/ui-conversation" && node "$CHECKOUT/node_modules/tsdown/dist/run.mjs" --config tsdown.config.ts)
  (cd "$CHECKOUT/packages/client/ui-primitives" && node "$CHECKOUT/node_modules/tsdown/dist/run.mjs" --config tsdown.config.ts)
  (cd "$CHECKOUT/packages/client/web" && node "$CHECKOUT/node_modules/tsdown/dist/run.mjs" --config tsdown.config.ts)
  (cd "$CHECKOUT/apps/web" && node node_modules/vite/bin/vite.js build)
}

if [ "$MODE" = "--check" ]; then
  if git -C "$CHECKOUT" apply --unidiff-zero --check --reverse "$PATCH" 2>/dev/null; then
    verify_source_markers
    echo "setup: sidebar Host support is present; inspect its receipt before an update"
  else
    git -C "$CHECKOUT" apply --unidiff-zero --check "$PATCH"
    echo "setup: sidebar Host patch applies to this checkout"
  fi
  echo "setup: inspection only; selected profile is $PROFILE_HOME/profiles/$PROFILE"
  exit 0
fi

echo "checking tracked harness patch against $CHECKOUT..."
if git -C "$CHECKOUT" apply --unidiff-zero --check --reverse "$PATCH" 2>/dev/null; then
  if [ "$RECORDED_SHA" = "$PATCH_SHA" ] && [ "$RECORDED_OWNED" = "true" ]; then
    PATCH_APPLIED_BY_SETUP=true
    echo "harness patch already applied by an earlier run of this exact setup"
  else
    echo "harness patch already present; preserving external ownership"
  fi
elif git -C "$CHECKOUT" apply --unidiff-zero --check "$PATCH"; then
  echo "applying harness patch..."
  git -C "$CHECKOUT" apply --unidiff-zero "$PATCH"
  PATCH_APPLIED_BY_SETUP=true
else
  echo "setup: neither the patch nor its exact reverse applies" >&2
  echo "setup: the target files overlap local changes or this DSH revision is unsupported" >&2
  echo "setup: no Host files were changed" >&2
  exit 1
fi

verify_source_markers
regenerate_shared_catalogs

{
  echo "patch_sha256=$PATCH_SHA"
  echo "patch_applied_by_setup=$PATCH_APPLIED_BY_SETUP"
  echo "host_head=$(git -C "$CHECKOUT" rev-parse HEAD)"
  echo "marker_schema=meta-intent-source-region/0.1"
  echo "regions=client.store.partial-persistence,shell.navbar.action,shell.navbar.clearance,shell.details.session-preferences,shell.details.divider,shell.details.maximized-layout,shell.details.unbounded-normal-width"
  echo "generated_catalogs=packages/extensions/cordis-client-runner/src/client/slot-catalog.ts,packages/extensions/cordis-client-runner/src/client/api-catalog.ts"
} > "$STATE_FILE"

rebuild_modified_host

echo "building dsh-right-sidebar..."
DSH_CHECKOUT="$CHECKOUT" bash "$REPO_DIR/scripts/build.sh"

run_plugin add "$PACKAGE_DIR"
run_plugin why @dsh-external/dsh-right-sidebar

echo "setup: sidebar registered; service activation is separate"
