# Candidate 11 evidence

The multi-instance source is frozen at `a6e9cdfb14b6a376f619e434745f78d038cf4595`; Host target is alpha.2 `0a53fb55bea101816fa226bb964ae2bed71c343b`. The implementation retains a single per-session instance ledger, separate Host visibility/width/maximization, fixed controls and a generic launcher home. The owned patch digest is `sha256:37e97d5df586ebaf326ec27b4d56215531bd4f0d7d425542eb03c68a0b4c0030`.

Focused tests: 24 sidebar tests, 45 generic viewer/editor tests, 20 file-manager tests, 29 AppFrame tests. Host/client builds passed. Private-Home testing used the installed package set and final artifact bytes. Real filesystem/manual/automatic synchronization, divergence, multi-instance buffers, selector navigation, CRUD with recoverable trash and immediate-reload drafts were exercised. A cold live Web loaded each of the four Client entries once without page errors; switching between established sessions retained open/maximized state and the active file editor.

Full commands and bounded results are in `../../../logs/2026-09-05-live-workbench.md`. This evidence does not establish user visual acceptance or a complete target-drift/uninstall rehearsal. The pre-existing global Cordis API generation partition violation remains unresolved; the current Host delta requires no API catalog change.
