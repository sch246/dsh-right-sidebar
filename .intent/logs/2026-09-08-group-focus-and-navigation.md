# Group focus and navigation

The user requested a thicker group focus border that clears when interacting elsewhere, then identified group ownership for Back/Forward. Actual pointer/keyboard focus now controls a three-pixel outline; activeGroupId retains default opening placement. History records authoritative tab activation and feature-reported in-tab jumps, rather than every DOM focus event.

Feature callbacks receive opaque descriptor checkpoints. The sidebar owns group histories, skips unavailable destinations and suppresses recording during replay. Viewer owns resolving file links and restoring text positions. History does not retain document text or become browser layout persistence.

No worktrees, tests or browser automation were used, as requested. The owned sidebar build completed against the selected Harness; UI behavior still awaits user observation.
