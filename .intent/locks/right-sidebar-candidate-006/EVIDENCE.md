# Right-sidebar C6 closure-candidate evidence

Observed on 2026-08-26 against source commit `aa4baa3660f0ab7a06793baf576166340343bd09`, Harness target `b642a10626a950cc95c2d6f839810cb01fe599fe`, and DSH standard commit `580b330323c13ec568adab2c35fabf8f8fa6b194`.

Passed:

- `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh`;
- shell suites: 2 files, 11 tests;
- Harness `ui-layout` suites: 6 files, 60 tests;
- `pnpm run typecheck:contracts-ready`;
- clean application of `patches/deepseek-harness.patch` to a fresh archive of its declared target commit;
- linked live assembly and public delivery recorded in `LIVE-EVIDENCE.md`;
- `node /root/meta-intent/locks/protocol-0.2/bin/validate.mjs .`.

The C4 visual regressions remain covered. C5 adds a declaration-level assertion for 32-pixel geometry and a borderless, shadowless resting style, while the layout fixture measures a 32-pixel navbar and reserves 48 pixels when details are closed.

The user subsequently exercised the deployed sidebar and confirmed that it runs and that the current live shell iteration can be closed. This supplies human runtime evidence for the shell and the state-level alignment effect. The portable adapter source and ownership boundary did not change. C6 remains package-wide incomplete because no target-drift maintenance, uninstall, or two-way/session-isolated feature fixture was performed for this exact realization.
