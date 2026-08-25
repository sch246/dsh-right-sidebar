# User decision: freeze implementation before creating its realization lock

Record ID: `SRC-2026-08-25-RIGHT-SIDEBAR-GIT-REFERENCE`

Status: user-authority record. It selects the immutable-reference strategy for the first sidebar realization; it does not accept the resulting implementation.

## Decision

The user decided that binding the realization to a Git commit is appropriate. The implementation is committed first as `C1`; a later lock commit `C2` refers to `C1`, the repository, and the governed paths. Because the referenced commit predates the lock, the lock does not include itself and no self-hash cycle occurs.

The concrete embedded-package and Git-target forms are supplied by the selected meta-intent protocol rather than redefined by this package.

## Consequence

The first candidate realization must name the complete immutable `C1` commit and a non-overlapping path set. It remains a candidate until lifecycle evidence and user authority justify acceptance.
