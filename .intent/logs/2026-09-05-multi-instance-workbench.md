# Multi-instance right-sidebar workbench

Record ID: `SRC-2026-09-05-RIGHT-SIDEBAR-MULTI-INSTANCE-WORKBENCH`

Status: User API and interaction decision. It supersedes the stable `rightbar.tab` and `ctx.rightSidebar.openTab()` semantics without selecting or accepting a realization.

## Desired interaction

The right sidebar is a multi-instance workbench. Its first row presents open instances as compact, horizontally scrollable tabs, followed by a fixed launcher button. The launcher opens a home view without closing existing instances. An instance remains in its owning session until explicitly closed, and each session retains its ordered instances and active selection when the mounted session changes.

The launcher home lists registered feature launchers and does not select a business feature by default. Feature plugins own launcher labels, creation behavior, static view renderers, instance titles and optional close vetoes. The platform owns only the per-session ordered instance ledger, active selection and workbench chrome.

The tab scroll area reserves the Host navbar controls through `--dsh-shell-navbar-width`, with an 80-pixel fallback. Close buttons are keyboard accessible and labelled. Narrow widths retain access to the launcher and Host controls rather than allowing tab labels to cover them.

## Stable client API

The additive session-scoped registration seat is `rightbar.view`. Each registration supplies one static renderer id; the panel passes `{ instanceId }` as owner props when rendering the active instance.

`ctx.rightSidebar` exposes `registerLauncher`, `launch`, `openInstance`, `activateInstance`, `updateInstance` and `closeInstance`. Launchers are lifecycle-owned registrations. Opening an instance validates the currently mounted session and live view registration before changing state, deduplicates by instance id, activates it and reveals the details column. Closing awaits the instance callback, preserves the instance when the callback returns `false`, and ignores stale completion after the instance or runtime has changed.

The runtime is the only authority for each session's ordered instances and active selection. The panel subscribes to that runtime state; no framework store or second ledger mirrors it. Layout width, visibility and maximization remain Host-owned.

## State and realization effect

This decision advances state from `0.3.0-draft.17` to `0.3.0-draft.18`. Existing candidates implement the superseded tab API and are removed from the current candidate selection without modifying their immutable bundles. Implementation and focused test evidence may produce a new candidate, but do not establish profile installation, live-browser acceptance or realization activation.
