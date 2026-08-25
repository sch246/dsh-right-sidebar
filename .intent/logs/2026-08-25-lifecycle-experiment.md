# Fact report: isolated install, drift, maintenance, and uninstall experiment

Record ID: `SRC-2026-08-25-RIGHT-SIDEBAR-LIFECYCLE-EXPERIMENT`

Status: Codex investigation evidence. It updates the candidate realization procedure and its known limits; it does not accept the realization or change sidebar intent.

## Scope and isolation

The experiment used a detached plugin worktree at commit `6b2b58863f0c6d5c94000a0e3be54f23227ce2dc`, a detached Harness worktree at patch baseline `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`, and a temporary `DSH_HOME` with a new `sidebar-lab` profile. It did not modify the existing `web` profile, restart `dsh-web`, apply the patch to the dirty live Harness checkout, or run a browser.

## Build observation

The exact plugin source rebuilt successfully against the existing prepared `/root/deepseek-harness` development checkout; both TypeScript checks and all six component tests passed.

Building against only the detached Harness baseline failed before plugin compilation. The Git commit does not contain the prepared vendored Cordis output and package-local `node_modules` links required by `scripts/build.sh`. Supplying only the root dependency tree was insufficient. This is evidence that source identity is closed while the build dependency closure is not yet reproducible from the lock.

## Install and maintenance observations

`dsh plugin --profile sidebar-lab add link:<exact-C1-worktree>` created one dependency, one bundle entry, and one profile symlink. `--dump-config` contained the sidebar bundle without starting a service.

The experiment then introduced three isolated drift witnesses:

- a comment in the plugin Cordis source;
- an unrelated disabled entry in the profile patch;
- a non-overlapping comment in a Harness file also modified by the owned patch.

The source and target Git diffs exposed the drift. Rebuilding succeeded, repeated `dsh plugin add` retained exactly one sidebar bundle, the unrelated profile patch bytes were preserved, and `git apply --reverse --check` proved that the owned Harness hunks remained removable.

## Uninstall observations

`dsh plugin remove @dsh-external/dsh-right-sidebar` removed the dependency, bundle, lockfile reference, pnpm-list entry, and sidebar dump-config contribution while preserving the unrelated profile patch. It nevertheless left `node_modules/@dsh-external/dsh-right-sidebar` as an orphan symlink. Neither a subsequent `pnpm install` nor `pnpm prune` removed it.

After verifying that the manifest, lockfile, pnpm metadata, and bundle no longer referenced the package and that the symlink resolved to the owned experimental checkout, exact unlink removed the orphan. Reverse-applying the Harness patch then removed all owned hunks while preserving the non-overlapping later comment as the only target diff. The source checkout and generated build outputs were not deleted.

## Consequence

The profile and Harness lifecycle can preserve unrelated drift, but the original realization procedure was incomplete. The candidate must add guarded orphan-link cleanup and retain incomplete acceptance for build closure, published-reference retrieval, browser behavior, feature fixtures, and machine-checked multi-target ownership.
