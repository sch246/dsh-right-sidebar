# Grouped workbench local realization

The governed implementation is sidebar `24207ab593aa516678936666d403238db2bdce9a`. Compatible companion implementations are viewer/editor `08f40e1c57ff171388e707a1eab8428631dcc89d` and manager `e7da9510f9e1c9ae8ce1f713e6dcfb7544142d95`. The Host baseline is DeepSeek Harness alpha.2 `0a53fb55bea101816fa226bb964ae2bed71c343b` plus the existing owned patch. This local installation retained unrelated dirty Host files; it is not proof that an arbitrary dirty checkout is applicable.

## Preparation and installation

Inspect each repository's instructions, current state, dependency resolution and worktree before building. The sidebar owns layout and instance lifecycle; the viewer owns generic sources, handlers and shared documents; the manager owns user filesystem operations and its tree. These implementations replace the old text-only opening API together.

Use separate candidate checkouts and a private Home reproducing the complete deployment composition before mutating active linked sources. Build the sidebar with `DSH_CHECKOUT=<host> bash scripts/build.sh`, then viewer/editor and manager with `DSH_CHECKOUT=<host> pnpm run build` in their respective repository roots. Manager dependencies use its frozen lockfile. Host and Typert outputs precede the manager Client build. Never use the live service as the initial composition probe.

The recorded local transaction, from `/root/deepseek-harness`, was:

```sh
DSH_HOME=/root/.dsh node --import tsx/esm apps/cli/src/bin.ts plugin --profile web add /root/dsh-right-sidebar /root/dsh-file-viewer/packages/dsh-file-viewer /root/dsh-file-viewer/packages/dsh-file-viewer-editor /root/dsh-file-manager/packages/dsh-file-manager
```

Require matching manifest specifiers, lockfile versions, installed realpaths, expected Bundle membership and composed configuration. The editor is a plain dependency; the other three packages are Bundles. This deployment has 17 dependencies and 18 Bundle layers. `plugin why` in pnpm 11 omits direct links; `pnpm list <name> --depth 0 --json` supplies the package-manager resolution evidence alongside manifest and lock inspection. Do not hand-edit profile dependency rows.

Activation requires separate authority. This deployment had explicit installation/restart authorization and used `systemctl stop dsh-web` before linked artifact replacement, then `systemctl start dsh-web` after profile checks. A fresh live browser verified four unique Client entries, the neutral launcher, Files, and README text in an adjacent group without errors. Service activity alone is not browser verification.

## Host ownership and recovery

The patch digest is `37e97d5df586ebaf326ec27b4d56215531bd4f0d7d425542eb03c68a0b4c0030`; `<Host git dir>/dsh-right-sidebar.patch-state` records the same digest and alpha.2 baseline. This upgrade did not apply a new Host patch. All patch-target files match the pre-install private copy, and `git apply --unidiff-zero --reverse --check patches/deepseek-harness.patch` from the Host with the absolute patch path succeeds. The zero-context flag is required.

On future drift, inspect owned source markers and the receipt before synthesizing a reviewed delta. Do not reset or replace dirty Host files. Uninstall may reverse only the exact attributable contribution and must regenerate aggregations from remaining contributions. Existing full setup/uninstall commands encounter the global `chat/open-workspace-file` Cordis API partition violation; do not run destructive stages blindly or claim lifecycle acceptance.

The previous source commits were sidebar `215f2dd580e6188b5009599e50242296d5488bcc`, viewer/editor `65755ff173c1b8aa8175eada1f17672e533823f5`, and manager `87ba7d677a845d29c59e5b37bd80288b84a0d862`. A rollback requires its own authority, coordinated companion versions, fresh builds and the same profile/browser checks. Recorded commits are recovery references, not permission to discard later user work.
