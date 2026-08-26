# Candidate 7 bounded evidence

Observed on 2026-08-26 against source commit `9e57ba08071172108498f6a6241d0d57afc30e5a` and Harness target `b642a10626a950cc95c2d6f839810cb01fe599fe`.

Checked without running test suites, as requested by the user:

- all changed Harness source markers contain compact `region`/`purpose` JSON and balance independently per package, without treating crossing package boundaries as malformed;
- 38 right-sidebar owner regions and 29 independently owned preset-manager regions were found across the combined checkout;
- `git apply --check --reverse patches/deepseek-harness.patch` succeeds on the current combined Harness worktree;
- `scripts/setup.sh`, `scripts/uninstall.sh`, and `scripts/build.sh` pass `bash -n`;
- both shared client catalogs were regenerated from source and neither catalog path occurs in this static patch;
- non-patch repository changes pass `git diff --check`.

This evidence establishes discoverable patch structure on the selected baseline. Marker balance is not mutation or removal authority. It does not establish compilation, automated behavior, live installation, runtime interaction, drift recovery, or an owned uninstall exercise for candidate 7.
