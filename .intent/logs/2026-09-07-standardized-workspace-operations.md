# Standardized workspace operations

The candidate keeps its existing independent repository, package versions and feature dependency graph. Root scripts expose build, typecheck, setup, inspect and remove by reusing existing operations. Build/test/typecheck and selected Host CLI calls use direct installed Node entrypoints; explicit installation/removal still use the Harness plugin transaction. Setup/remove remain inspection-only by default. No installer framework or feature dependency was added.

Root and distributed manifests declare MIT and each package carries the root license with existing attribution. AGENTS retains the primary repository’s meta-intent guidance and the stable sibling map locator. README and STATE name the root entries, compatible independent versions and optional cooperation.

This candidate was prepared without package-manager wrappers, dependency installation, Host/profile edits, activation or publication. Validation evidence is recorded below.


STATE's historical candidate/acceptance and deployment-status paragraphs were removed from the installation map. Their evidence remains in the existing tab-menu, per-session layout and grouped-deployment logs; those past observations do not certify the selected target. Removed references to the retired per-instance native-file receiver API and its duplicate-file-drop-handler error; independent file-drop routing remains documented.

Executed `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh` in the isolated candidate: exit 0, all owned Host/Client declarations and bundles emitted. The output is recorded at `/tmp/dsh-right-sidebar-standardize-build.log`. TypeScript 5.9.3, tsdown 0.22.14 and Vitest 4.1.8 were resolved from independently prepared candidate dependency directories. No runtime source was changed, so no behavior suite or browser automation was added or run.

Executed the new `DSH_CHECKOUT=/root/deepseek-harness bash scripts/typecheck.sh`: exit 0 for both programs. An earlier attempt stopped before compilation because a referenced historical tool directory was moved; updating only candidate leaf links to surviving tools resolved the locator failure.

`bash -n` passed for every owned shell script. Manifest checks confirmed all five root entry names, MIT declarations and identical root/package license texts, with existing independent package versions and runtime dependency declarations retained. `git diff --check` passed. Installation/removal modes were inspected statically; no Host adapter build, profile transaction, service activation or package-manager invocation was executed.
