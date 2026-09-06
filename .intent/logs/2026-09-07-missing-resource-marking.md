# Missing-resource marking on the independent sidebar

The reviewed `8ec22a0` contribution was selectively applied to the workspace package on the decoupled `d84f096` base. Package relocation, generated meta-intent entry, dependency policy and existing realization locks were preserved; no historical root source or lockfile was imported.

`resourceMissing` is feature-owned presentation state. Input and update fields are optional, omission preserves the current marking, and hydration starts unmarked until a feature reports. Renderer availability remains independent. The tab button itself carries `dsh-rightbar-tab-label`, so the supplied CSS selector already matches the element. The computed-style test required explicitly mounting the stylesheet and reading its `text-decoration` property. Tests cover marking, clearing, update preservation and unmarked restoration.

Validation in `/root/dsh-decoupling-apply/sidebar` against `/root/dsh-decoupling-615gv0tt/harness`:

- `DSH_CHECKOUT=/root/dsh-decoupling-615gv0tt/harness pnpm build` passed.
- `DSH_CHECKOUT=/root/dsh-decoupling-615gv0tt/harness pnpm typecheck` passed.
- `DSH_CHECKOUT=/root/dsh-decoupling-615gv0tt/harness pnpm test -- tests/right-sidebar.client.spec.tsx tests/workbench-api.client.spec.ts` passed: this package script collected four existing files, 45 tests.
- `git diff --check` passed.

The candidate worktree received source and build output only. No live profile, Host source, service, publication or browser test was changed or run by this worktree's implementation task.
