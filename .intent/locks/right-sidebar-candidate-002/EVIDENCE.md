# Right-sidebar C2 candidate evidence

Observed on 2026-08-25 against source commit `a522fb187a8afef060216f919ec32448caf98129` and DSH standard commit `580b330323c13ec568adab2c35fabf8f8fa6b194`.

Passed:

- `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh`
- shell test suites: 2 files, 10 tests
- DSH standard UI and adapter typechecks
- focused adapter suites: 2 files, 28 tests
- source-level portable facet -> `DshBrowserUiRuntime` -> DSH `SlotRegistry` -> right-sidebar owner integration
- `node /root/meta-intent/locks/protocol-0.2/bin/validate.mjs .`

The shell tests cover empty state, tab switching/unload selection repair, keyboard navigation, loading fallback, render-failure containment and retry, non-Error thrown values, layout-owner toggle state, registration cleanup, and adapter owner remount lifecycle.

The portable fixture imports no Harness, right-sidebar, or adapter package. The test harness still depends on explicit source checkout aliases and bypasses production profile discovery, browser module serving, the live renderer and live layout.

Historical C1 lifecycle evidence remains applicable only to its exact source and patch baseline. C2 has not been installed, drift-maintained, uninstalled, or browser-recorded and remains incomplete.
