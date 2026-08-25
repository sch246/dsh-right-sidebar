# Navbar control alignment deployment

Record ID: `SRC-2026-08-26-NAVBAR-CONTROL-DEPLOYMENT`

Status: checked implementation and live delivery evidence; final visual acceptance remains with the user.

Commit `aa4baa3660f0ab7a06793baf576166340343bd09` aligns the sidebar toggle with host header controls. The shell defines a 32 by 32 pixel, transparent, borderless and shadowless resting button; the Harness navbar uses a 12 pixel top inset.

The sidebar suites passed 2 files and 11 tests. The Harness `ui-layout` suites passed 6 files and 60 tests. The rebased Harness patch applied cleanly to its declared target archive.

After rebuilding the linked shell and Harness layout client, `dsh-web` restarted and returned to `active`. Both local and public roots returned HTTP 200. The public boot selected layout revision `053fe3abee29` and sidebar revision `0489213d29c2`; their served bytes contain the selected 12-pixel inset and 32-pixel borderless/shadowless toggle declarations.

No controllable browser automation was available. This evidence proves delivery of the selected declarations, not their final rendered appearance.
