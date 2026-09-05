# Grouped resource workbench deployment

The user authorized implementation and explicitly requested installation and Web restart after isolated verification. The coordinated upgrade uses sidebar `24207ab593aa516678936666d403238db2bdce9a`, viewer/editor `08f40e1c57ff171388e707a1eab8428631dcc89d`, and manager `e7da9510f9e1c9ae8ce1f713e6dcfb7544142d95`. The Host remains alpha.2 `0a53fb55bea101816fa226bb964ae2bed71c343b` with its 166 pre-existing dirty entries preserved.

## Private verification

The high-risk coordinated API cutover was built in separate Git worktrees and exercised with a private Home reproducing all 17 installed dependencies and 18 Bundle layers. The private Host copied the live dirty source without `.env`; only the third-party package store was shared. The editor stayed a plain dependency rather than a Bundle. The browser used loopback, private sessions and disposable filesystem fixtures.

Focused checks passed: sidebar 28 tests and both TypeScript programs; viewer/editor 75 tests and typecheck; manager 36 tests and typecheck. Each repository's owned build completed. Real browser verification covered launcher/tree separation, replaceable preview and permanent pinning, four-edge docking and center joins, tab reordering, split and vertical-rail resizing, session open/maximized retention, and reload restoration with initially hidden visibility. Internal drag delivery was additionally checked against exact shared document text so DOM whitespace was not mistaken for a document change.

Text verification covered exact edit-revert status, manual save, inherited automatic settings, automatic save, external automatic update, three-way conflict pause, dirty-close cancellation and reload draft recovery. SVG image/text switching retained one view id; cancellation retained the text handler and acknowledged switching retained its draft. Memory fixtures exercised source read/write/watch, optional selector dispatch, caller-provided names, shared documents across groups, close-one retention and final subscription cleanup. Byte RPC preserved `AP+AQQ0K`, rejected a stale publication and rejected text decoding of NUL-bearing data.

Directory polling detected new fixtures without manual refresh. Filtering retained ancestors. Permanent deletion of one disposable fixture asked once; another fixture went to the configured recoverable trash without confirmation. No user files were edited or deleted. A 300-entry expansion took 309 ms, filtering took 91 ms, and a warmed 5,000-line reopen took 123 ms with 10 rendered lines in this one local run; these are observations, not performance guarantees.

Integration exposed and fixed a Remote lifecycle-name collision, opaque group surfaces, premature text mounting, late view checkpoints, close cleanup before authoritative removal, metadata updates clearing close guards, restoration checkpoint ordering, internal drag ids entering editor text, and missing source metadata replacing display names. Failed intermediate screenshots and server-restart connection errors are not successful acceptance evidence.

## Activation

After private acceptance, the three clean deployment checkouts fast-forwarded to the reviewed commits. The managed service was stopped during coordinated builds so it could not serve mixed APIs. Manager dependency installation used its frozen lockfile with lifecycle scripts disabled. Sidebar, viewer/editor, and manager rebuilt against the live Host in dependency order; their four browser bundles are byte-identical to the private candidates.

One `dsh plugin --profile web add` transaction installed the four absolute local package paths. Manifest specifiers, lockfile versions, realpaths, dependency existence, Bundle membership and composed configuration passed. This pnpm 11 version emits no `why` rows for direct links; `plugin why` exited successfully and `pnpm list --depth 0 --json` independently identified each expected link. The profile still contains 17 dependencies and 18 Bundles; its local patch is unchanged.

The existing Host patch and receipt were not rewritten. Patch SHA-256 remains `37e97d5df586ebaf326ec27b4d56215531bd4f0d7d425542eb03c68a0b4c0030`; `git apply --unidiff-zero --reverse --check` passed. A preliminary reverse check without the required zero-context flag failed and was not treated as a drift result. All 15 patch-target files match the private baseline byte for byte.

The service restarted successfully with MainPID `1913261`, active/running and zero automatic restarts. A fresh live page without instrumentation loaded each of the four Client entries once, opened the neutral launcher, then opened Files and the existing Host README in a separate right-hand group. No page errors, failed requests, console errors or visible plugin-failure UI were observed. The live smoke did not edit that file or invoke a model.

## Evidence boundary

Candidate `right-sidebar-linux-web-0.4.0-candidate.1` freezes this state, implementation identities and bounded verification evidence. It is installed locally, not user-accepted. The existing global Cordis API generator partition violation for `chat/open-workspace-file` remains unresolved; the private client catalog generator passed without a catalog change. Grouped-workbench uninstall and unrelated-drift preservation have not been rehearsed. Historical locks remain unchanged.
