# dsh-std runtime removal evidence

Record ID: `SRC-2026-08-27-DSH-STD-RUNTIME-REMOVAL-EVIDENCE`

Status: bounded realization and deployment evidence for `SRC-2026-08-27-DSH-STD-RUNTIME-REMOVAL`. It does not revise right-sidebar STATE, accept a new realization, or change the selected protocol.

Checked results on 2026-08-27:

- the Web profile no longer contains `@dsh-std/adapter-dsh` in its dependencies, bundle list, lockfile, package links, or dumped runtime configuration;
- `dsh-preset-manager`, `@dsh-external/dsh-right-sidebar`, and `@deepseek-ai/dsh-skill-manager` remain independently linked and bundled;
- the right-sidebar direct API passes TypeScript checking, 11 package tests, and a browser bundle rebuild against the current Harness checkout;
- affected Harness UI tests pass 67 files and 1,026 tests; core, skill, Cordis integration, session, and scope checks pass 27 files and 526 tests;
- Cordis and client catalogs are current, Host type checking passes, and the affected layout, workspace, and conversation bundles rebuild;
- `dsh-web` restarted at 2026-08-27 10:26 CST, remained active without restart, and returned HTTP 200 from `127.0.0.1:3082`;
- `/root/dsh-std` is absent from its original path and remains recoverable from `/root/.local/share/Trash/files/dsh-std` with its trash metadata.

The evidence supports removing the obsolete runtime dependency while preserving the direct right-sidebar realization. It does not imply that dsh-std's repository history or design experiments were semantically invalid.
