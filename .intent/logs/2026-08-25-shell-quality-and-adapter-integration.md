# Shell quality and standard-adapter integration

Record ID: `SRC-2026-08-25-SHELL-QUALITY-AND-ADAPTER-INTEGRATION`

Status: Agent implementation and investigation evidence under the user's product-quality and adapter-direction decisions. It revises the selected candidate; it is not user acceptance.

## Scope and authority

The user directed the Agent to continue implementation. Earlier authority permits autonomous UX choices that preserve the stated sidebar effects and requires product-quality interaction rather than a skeletal platform. This run changed and committed local source plus intent state only. It did not apply a Harness patch, modify a live profile, restart `dsh-web`, publish, push, or remove anything.

## Implemented shell behavior

Commit `a522fb187a8afef060216f919ec32448caf98129` adds explicit loading, contribution-failure and retry states; an error boundary that also contains non-Error thrown values; focus restoration after the selected contribution disappears; active-tab ARIA relationships; narrow-width layout treatment; reduced-motion-aware transitions; and visible keyboard focus.

The platform still contributes no business tab. Selection remains session-scoped shell interaction state, while layout visibility and width stay authoritative in the Harness layout owner.

## Adapter integration evidence

DSH standard commit `580b330323c13ec568adab2c35fabf8f8fa6b194` guarantees `SidebarViewProps.sessionId` as a portable render partition key. A fixture importing only `@dsh-std/manifest`, `@dsh-std/sdk`, `@dsh-std/ui`, and `@dsh-std/ui-browser` registers two sidebar definitions.

A source-level integration test mounts that fixture through the real `DshBrowserUiRuntime`, real DSH `SlotRegistry`, and this shell owner. The definitions stay inert before the owner exists, materialize after it mounts, abort and dispose on owner removal, and receive new runtime identities after remount. The shell rebuilt successfully; its two suites passed 10 tests; the focused adapter suite passed 28 tests; both standard packages passed typecheck.

## Evidence boundary and remaining tension

The integration test intentionally bypasses production profile discovery, browser catalog loading, package-local module serving, and the live renderer. It uses explicit source-checkout aliases, so it is strong lifecycle/mapping evidence but not portable installation evidence.

`sessionId` makes consumer-owned session partitioning possible without Harness-private props, but it does not alone prove `SIDEBAR-005`. A future fixture must render a main-view contribution and sidebar view against one state/action owner, mutate it from both sides, switch sessions, and observe isolation through applicable standard surface/domain protocols.

The direct Harness patch remains owned by this transitional package. The transition is not complete until its Harness-private responsibilities move into an adapter-managed realization and browser/install/drift/uninstall acceptance succeeds.
