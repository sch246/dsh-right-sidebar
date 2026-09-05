# Restoration commit acknowledgment

Record ID: `SRC-2026-09-05-RIGHT-SIDEBAR-RESTORATION-COMMIT-ACK`

Status: User-authorized stable API clarification. It does not select, accept, install, or activate a realization.

## Observed lifecycle gap

A generic restorer can discover newer feature metadata while reconstructing an instance. Calling `updateInstance()` before the restorer returns changes instance identity, so the sidebar correctly rejects the stale restoration result and cannot install its close callbacks. Delaying the update with a timer guesses at commit ordering and provides no lifecycle guarantee.

## Stable effect

`RightSidebarRestoreResult` includes optional synchronous `onRestored`. The runtime invokes it only after the exact restoring instance is authoritatively committed `ready` with returned `onClose` and `onClosed` callbacks installed. A feature can suppress descriptor writes during its restorer and flush its latest JSON-safe descriptor from `onRestored`.

Stale identity, restorer rejection, registration removal and runtime disposal do not invoke `onRestored`. Notification exceptions are reported without reverting the committed ready instance. The callback is not accepted by ordinary open or renderer-switch inputs because it acknowledges restoration only.

## State effect

This clarification advances state from `0.4.0-draft.1` to `0.4.0-draft.2`. It changes no layout ownership, placement, preview, close, Host or deployment semantics.
