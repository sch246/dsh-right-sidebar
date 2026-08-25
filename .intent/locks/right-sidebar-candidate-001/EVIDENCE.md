# Candidate evidence

Observed on 2026-08-25 against source commit `6b2b58863f0c6d5c94000a0e3be54f23227ce2dc`.

Passed:

- `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh`
- `/root/deepseek-harness/node_modules/.bin/tsc -p tsconfig.json --noEmit`
- `/root/deepseek-harness/node_modules/.bin/tsc -p tsconfig.client.json --noEmit`
- `npm test` — 1 file, 6 tests
- `git apply --check` for `patches/deepseek-harness.patch` in a detached Harness worktree at `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- `node /root/meta-intent/locks/protocol-0.2/bin/validate.mjs /root/dsh-right-sidebar` before selecting this lock
- isolated exact-C1 `link:` install into a temporary `DSH_HOME` profile;
- source, profile, and non-overlapping shared Harness drift detection;
- rebuild and idempotent profile reconciliation with one sidebar bundle;
- profile uninstall preserving an unrelated profile patch;
- Harness reverse removal preserving a later non-overlapping target change.

Not yet established:

- fresh retrieval from the published Git reference;
- reproducible build from only immutable referenced inputs;
- uninstall without guarded cleanup of the orphan profile symlink;
- independent semantic review of every user-visible implementation choice.

Observed failure boundaries:

- the detached Harness source baseline lacked required built vendored/package dependency outputs, so it could not alone satisfy the declared build command;
- `dsh plugin remove`, followed by `pnpm install` and `pnpm prune`, left an inactive package symlink after every active profile reference was removed;
- no service or browser was started, and the external multi-tab plus cross-surface session fixture criteria remain unobserved.
