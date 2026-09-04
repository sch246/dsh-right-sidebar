# Stable programmatic tab opening API

Record ID: `SRC-2026-09-05-RIGHT-SIDEBAR-PROGRAMMATIC-TAB-OPENING`

Status: User API decision and implementation scope. It revises the stable client API without selecting or accepting an alpha.2 realization.

## User decision

Feature plugins need a stable way to select and reveal one of their registered right-sidebar tabs without receiving the platform's store or actions. The DeepSeek Harness realization therefore exposes `ctx.rightSidebar.openTab(sessionId, tabId)` from the public `@dsh-external/dsh-right-sidebar/client` coordinate.

The operation applies only to the session currently bound to the mounted `details` entry. It verifies that binding and the live `rightbar.tab` ledger before selecting the tab and opening the details column. An absent mount, a different session, or an unknown tab fails explicitly and leaves both selection and layout unchanged.

## Responsibility and lifecycle

The renderer remains the authority for session identity and the session-scoped store instance. The details entry's framework inject receives that session's baked actions; the panel activates the resulting private binding while mounted. Public callers receive only the service method.

Binding replacement and disposal invalidate old actions. Cordis owns service and slot registration teardown, while panel mount cleanup removes the current renderer binding. A retained old service or inject face cannot reactivate a disposed runtime.

## State and evidence boundary

This decision advances state from `0.3.0-draft.15` to `0.3.0-draft.16`. Focused source tests may establish selection, layout opening, validation failures, replacement and teardown behavior. They do not establish profile installation, live-browser behavior, realization acceptance, or a new Harness lock.

## Implementation evidence

The public declaration exports the Context service, a session-id alias, and `RightSidebarOpenTabError` with stable `not-mounted`, `session-mismatch`, and `unknown-tab` codes. The details inject receives renderer-resolved session/actions, and the panel activates that private pair only while mounted. Cordis effects own the service, slot, locale, style, and runtime-invalidation lifetimes.

`DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh` completed. The focused Vitest command covering the opening API, panel/toggle behavior, and registration contract passed 15 tests across three files. No Harness source, profile, service, lock, published artifact, or remote Git state changed.
