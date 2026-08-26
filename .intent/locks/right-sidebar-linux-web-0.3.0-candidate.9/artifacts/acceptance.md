# Candidate 9 bounded evidence

Observed on 2026-08-26 against source commit `caa1031c139ca6567ad7f2186ff66466d5689280` and official Harness remote target `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`.

Checked without running test suites, as requested by the user:

- all changed Harness source markers use a package token plus ordinary `(purpose: ...)` commentary and balance independently per package, without treating crossing package boundaries as malformed;
- 38 right-sidebar owner regions and 29 independently owned preset-manager regions were found across the combined checkout;
- the patch passes forward applicability in a detached clean `b150a551` worktree, and preset-manager remains forward-applicable after right-sidebar is applied there;
- the patch passes exact reverse applicability on the current combined local assembly worktree;
- `scripts/setup.sh`, `scripts/uninstall.sh`, and `scripts/build.sh` pass `bash -n`;
- both shared client catalogs were regenerated from source and neither catalog path occurs in this static patch;
- non-patch repository changes pass `git diff --check`.

This evidence establishes discoverable patch structure and applicability on the remote baseline. Purpose prose is not parsed as authority, and marker balance is not mutation or removal authority. It does not establish compilation, automated behavior, live installation, runtime interaction, drift recovery, or an owned uninstall exercise for candidate 9.
