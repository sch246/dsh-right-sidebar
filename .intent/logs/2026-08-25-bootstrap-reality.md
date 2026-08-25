# Bootstrap reality: existing plugin and unresolved realization identity

Record ID: `SRC-2026-08-25-RIGHT-SIDEBAR-BOOTSTRAP-REALITY`

Status: Agent fact and tension report. It does not approve the existing implementation or select a realization lock.

## Checked facts

- The repository is a conventional DSH/npm package whose root `package.json` declares `dsh.bundle` and `dsh.client`; DSH links that root checkout into a profile.
- Meta-intent protocol 0.1 treats an intent-package root as the three semantic areas `logs`, `state`, and `locks`. Running that topology directly against the DSH package root would reject its package manifest, source, tests, and build files.
- An embedded `.intent/` root preserves both layouts. The current 0.1 validator can validate that directory when it is supplied explicitly, but protocol 0.1 does not yet define repository-level discovery through `AGENTS.md`.
- Repository HEAD is `f04501bfd63b2898cb259f3c7676ac713a8c9cd0`. The current implementation files, tests, scripts, and Harness patch are not all represented by that commit; the worktree is dirty and many implementation paths are untracked.

## Identity tension

Binding the candidate realization only to current HEAD would omit the actual worktree implementation. Binding a lock to a future whole-repository commit that contains the lock itself would create a self-reference problem.

A candidate realization therefore needs an identity boundary such as an external immutable commit, a Git tree or path-set digest that excludes `.intent/`, or a manifest of owned target paths and content digests. The first real lock must record which boundary it uses, why it is sufficient, and how drift and uninstall ownership are checked.

## Current consequence

This bootstrap creates state and provenance but deliberately selects no realization lock. The existing implementation remains evidence to be frozen and classified; it is not yet a reproducible realization under this package.
