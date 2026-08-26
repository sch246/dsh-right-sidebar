# New-conversation visibility repair evidence

Record ID: `SRC-2026-08-26-RIGHT-SIDEBAR-NEW-CONVERSATION-REPAIR`

Status: Agent implementation evidence following the user feedback, tension record and state revision. It does not claim live deployment acceptance.

## Implemented target change

The Harness layout now treats sidebar visibility as application layout state rather than deriving availability from a non-blank conversation. `AppFrame` tracks the current session identity only for session-change closure; blank state and absence of a current session no longer force the details width to zero.

The change also removes the previous hidden-open behavior. Changing from one session id to another, including a blank session, closes the sidebar through the existing authoritative action. Opening on a no-session new-conversation interface remains visible when the first session materializes unless another session transition closes it.

## Regression evidence

- The new tests failed before the target change with `[280, 0]` instead of `[280, 360]` for both a blank session and no current session.
- After the change, the focused AppFrame suite passed 28 tests.
- The complete ui-layout suite passed 62 tests across 6 files.
- The Harness host TypeScript build passed.
- The right-sidebar build and 11 plugin tests passed.
- The plugin-owned Harness patch was regenerated from its declared clean baseline. It passes forward application on that baseline and reverse checking against the current target worktree.
- Protocol 0.2 validation and both worktrees' diff checks pass.

## Uncovered boundary

The refactored source and patch have not been installed into the live profile and `dsh-web` has not been restarted in this step. The user-visible new-conversation interaction therefore remains pending deployment verification.
