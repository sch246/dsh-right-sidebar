# Candidate 10 acceptance evidence

The candidate targets DeepSeek Harness alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b` and references plugin implementation commit `4839bdafeb75838891db2b86038b1855f248cb4c`. The Host intervention remains the plugin-owned `patches/deepseek-harness.patch`; no upstream DSH branch, pull request, or remote state changed.

The patch applies with `git apply --unidiff-zero --check` on a clean target worktree and reverses from the synthesized target. Runtime source interventions contain balanced `@meta-intent` ownership markers. Its SHA-256 is `6a938dca4247ba4aa86c3d8ed1db9316f6e96f7eb572d6f320a33fd89e7254da`.

`pnpm test` in the plugin passes 17 tests across three files, and `pnpm run typecheck` passes. Five focused Host specifications for the layout store, column solver, layout service, root registration, and AppFrame pass 63 tests. The affected Host TypeScript projects, package bundles, Web frontend, and plugin client bundle build successfully.

The existing linked `web` profile was retained. `dsh-web` restarted active and the local root returned HTTP 200. Browser checks observed one closed-state control, maximize plus close in ordinary mode, restore plus close in maximized mode, visible Host-token selected fills, `280px 0px 1320px` maximized tracks at a 1600-pixel viewport, and an inert mounted center. Maximization survived close/reopen, reload/reopen, and session-change/reopen. Ordinary drag rendered a 1000-pixel sidebar at a 1920-pixel viewport, above the removed 520-pixel ceiling.

Global Cordis API catalog regeneration is not accepted evidence: the existing `chat/open-workspace-file` event fails its rendering-projection partition check. The client slot catalog regenerated, and the local installation receipt names the deferred API catalog.
