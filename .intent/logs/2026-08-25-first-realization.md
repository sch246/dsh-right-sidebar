# Fact report: first frozen right-sidebar realization

Record ID: `SRC-2026-08-25-RIGHT-SIDEBAR-FIRST-REALIZATION`

Status: Agent fact and tension report. It records a candidate implementation and limited evidence; it does not accept the candidate or assert lifecycle completion.

## Frozen source

- Repository: `https://github.com/sch246/dsh-right-sidebar.git`
- Implementation commit: `6b2b58863f0c6d5c94000a0e3be54f23227ce2dc`
- The governed paths are enumerated by the candidate lock. `.intent/` is outside that implementation identity so the later lock commit does not create a self-reference.

## Evidence observed on 2026-08-25

- `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh` completed and produced the Node entry, browser bundle, and declarations.
- The Harness checkout TypeScript compiler passed `tsconfig.json --noEmit` and `tsconfig.client.json --noEmit`.
- `npm test` passed one test file and six tests.
- `patches/deepseek-harness.patch` passed `git apply --check` in a detached worktree at Harness commit `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`.
- The embedded package passed the meta-intent 0.2 validator before the realization lock was selected.

## Remaining tension

No fresh lifecycle experiment has yet installed this exact Git reference into a clean profile, introduced target drift, maintained it, and then uninstalled only its owned contribution. The Harness patch affects a second repository, while protocol 0.2 mechanically validates only the realization's primary Git target. The candidate therefore remains incomplete and pending user review.
