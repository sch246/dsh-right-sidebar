# Candidate evidence

Observed on 2026-08-25 against source commit `6b2b58863f0c6d5c94000a0e3be54f23227ce2dc`.

Passed:

- `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh`
- `/root/deepseek-harness/node_modules/.bin/tsc -p tsconfig.json --noEmit`
- `/root/deepseek-harness/node_modules/.bin/tsc -p tsconfig.client.json --noEmit`
- `npm test` — 1 file, 6 tests
- `git apply --check` for `patches/deepseek-harness.patch` in a detached Harness worktree at `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- `node /root/meta-intent/locks/protocol-0.2/bin/validate.mjs /root/dsh-right-sidebar` before selecting this lock

Not yet established:

- clean install from the published Git reference;
- reconciliation after real upstream or profile drift;
- ownership-preserving uninstall from a modified target;
- independent semantic review of every user-visible implementation choice.
