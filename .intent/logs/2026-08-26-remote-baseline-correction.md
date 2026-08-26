# Harness remote baseline correction

Date: 2026-08-26

The user clarified that the official Harness remote baseline is `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`, not the local checkout HEAD `b642a10626a950cc95c2d6f839810cb01fe599fe`.

Investigation found that `b642a106` is a local branch five commits ahead of `origin/master`, containing the independent skill-enablement work. Those commits do not modify any path in the right-sidebar patch. In a detached clean worktree at `b150a551`, the current purpose-comment patch passes forward applicability; after applying it, the preset-manager patch also passes, so the two patches compose on the remote baseline.

Current state and the next candidate bind the reproducible remote target to `b150a551`. The dirty live checkout at local `b642a106` remains assembly context only and is not committed or pushed by this package.
