# Grouped sidebar workbench

Record ID: `SRC-2026-09-05-RIGHT-SIDEBAR-GROUPED-WORKBENCH`

Status: User-authorized intent revision and implementation scope. It does not select, accept, install, or activate a realization.

## Desired interaction

Each session has one resizable layout tree. Its leaf groups own ordered tabs, one active tab, tab orientation, and retained vertical-rail width. Split branches own their ratios. The existing Host remains the authority for sidebar visibility, ordinary outer width, and maximization.

Each group permits one replaceable preview. A preview is italic, double-click pins it, and the first edit pins it through the public service. Replacing a preview honors its asynchronous close decision. A veto cancels the new open explicitly; a later concurrent open supersedes an older completion.

Dragging a tab over the outer ten percent of a group previews the half-area produced by an up, down, left, or right split. The center joins the group and tab-bar drops choose an insertion position. Hover does not change layout. Drop commits the move and pins the moved tab. Empty non-root groups collapse.

Groups can show horizontal tabs or a browser-style vertical rail. The workbench retains each vertical rail width while horizontal mode is active, uses a horizontal default for new sessions, and retains a per-session default preference for newly created groups. Split ratios and rail widths have keyboard and reset affordances without a fixed maximum.

## Public API and restoration

The renderer owner remains `{ instanceId }`; group location is available through `getInstanceGroup()` and `resolveTarget()`, so this revision does not change the Host slot catalog. Relative targets name a source instance and `center`, `left`, `right`, `up`, or `down`. Existing directional groups are resolved centrally by geometry, nearest distance, and tree preorder; `openInstance()` creates a half split only when none exists.

`openInstance()` is asynchronous, accepts placement and preview options, and returns the actual group id. The service also exposes `pinInstance()`, same-id `switchInstanceView()`, and one `registerRestorer()` callback per renderer id. Feature plugins provide JSON-safe restore descriptors. Browser restoration retains layout and tabs as missing or failed placeholders until the required renderer and restorer reconstruct feature state; missing registrations never delete persisted tabs.

`updateInstance()` checkpoints a replacement restoration descriptor without changing renderer, group, order or close callbacks. This lets feature plugins retain evolving view state without misusing renderer switching.

Feature cleanup is a two-phase lifecycle. `onClose` only decides whether an instance may close. The synchronous `onClosed` notification releases feature state only after the sidebar commits removal of that exact instance. Vetoed, stale and superseded operations do not send it; notification exceptions are reported without rolling back the authoritative layout.

Tabs retain identity while reordered or moved. Feature-owned document and view state remains outside the sidebar platform. The platform does not interpret files, resources, handlers, drafts, or editor state.

## State and realization effect

This decision advances state from `0.3.0-draft.19` to `0.4.0-draft.1`. Candidate 11 remains immutable historical evidence and is removed from current candidate selection because it implements the superseded single-group ledger. A new realization lock is sealed only after source, target, persistence, interaction, and failure evidence are complete.
