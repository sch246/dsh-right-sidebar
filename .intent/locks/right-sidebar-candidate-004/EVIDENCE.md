# Right-sidebar C4 candidate evidence

Observed on 2026-08-26 against source commit `794ecd03fc9b80619b679b5d33f844f55b786eb9`, Harness target `b642a10626a950cc95c2d6f839810cb01fe599fe`, and DSH standard commit `580b330323c13ec568adab2c35fabf8f8fa6b194`.

Passed:

- `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh`;
- shell suites: 2 files, 10 tests;
- Harness `ui-layout` suites: 6 files, 60 tests;
- `pnpm run typecheck:contracts-ready`;
- clean application of `patches/deepseek-harness.patch` to a fresh archive of its declared target commit;
- linked live assembly and public delivery recorded in `LIVE-EVIDENCE.md`;
- `node /root/meta-intent/locks/protocol-0.2/bin/validate.mjs .`.

The panel regression failed before the fix because empty chrome remained and passed after it was removed. The layout regression failed before the fix because no navbar clearance was reserved and passed after measured clearance was introduced. Existing resize tests still exercise pointer capture on the full-height divider after removal of the decorative pill.

The portable adapter source and ownership boundary did not change. C4 remains incomplete because no controllable browser executed the public modules and no target-drift maintenance, uninstall, or two-way/session-isolated feature fixture was performed for this exact realization.
