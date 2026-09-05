# Internal tab drag protocol

Record ID: `SRC-2026-09-05-RIGHT-SIDEBAR-INTERNAL-TAB-DRAG`

Status: User-authorized interaction correction. It does not select, accept, install, or activate a realization.

## Observed failure

A real browser drop of a sidebar tab onto group content reached the embedded CodeMirror drop handler before the workspace bubble handler. The tab used `text/plain`, so CodeMirror inserted the feature instance UUID into the document even though the sidebar subsequently completed the requested center or edge docking.

## Stable effect

Sidebar tab drags use a sidebar-owned custom MIME and do not publish `text/plain`. The workspace recognizes that MIME during event capture and completes content-area docking before child editors can consume the drop. Tab-bar targets remain on their own reorder path rather than being swallowed by workspace capture.

Unrecognized external text, file and feature-specific drags pass through unchanged. The sidebar must not prevent or reinterpret editor drops merely because they occur inside its content surface.

## State effect

This correction advances state from `0.4.0-draft.2` to `0.4.0-draft.3`. It clarifies docking isolation without changing layout, group, preview, restoration, close or Host ownership.
