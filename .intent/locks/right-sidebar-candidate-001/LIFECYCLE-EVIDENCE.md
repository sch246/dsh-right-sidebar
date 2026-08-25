# Isolated lifecycle evidence

Observed on 2026-08-25. Ephemeral absolute paths are omitted; every source and target identity below was checked before mutation.

## Identities and isolation

- plugin source: detached worktree at `6b2b58863f0c6d5c94000a0e3be54f23227ce2dc`;
- Harness patch target: detached worktree at `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`;
- assembly: new `sidebar-lab` profile under a temporary `DSH_HOME`;
- excluded: existing `web` profile, `dsh-web`, dirty live Harness checkout, browser runtime.

## Observations

1. The patch passed forward check and applied to twelve files at the declared baseline.
2. Exact plugin source built against the prepared development checkout; both TypeScript checks and six tests passed.
3. A clean temporary profile installed the exact source through `link:`, selected one sidebar bundle, resolved the expected symlink, and projected the sidebar entry through `--dump-config`.
4. Source, unrelated profile, and non-overlapping shared-target drift were detected. Rebuild and repeated add preserved the profile drift and exactly one sidebar bundle.
5. Standard remove cleared manifest, lockfile, pnpm-list, bundle, and dump references but left an orphan package symlink. Install and prune did not remove it.
6. Guarded exact unlink removed the proven orphan. Reverse patch check and removal succeeded, leaving only the unrelated later Harness comment.

## Interpretation boundary

This is positive evidence for isolated profile composition and drift-preserving Harness removal with the corrected procedure. It is negative evidence for a closed build environment and for standard remove being sufficient. It does not prove browser acceptance, semantic completeness, remote availability, or general multi-package compatibility.
