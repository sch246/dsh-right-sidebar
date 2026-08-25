# Live web profile installation

Record ID: `SRC-2026-08-25-LIVE-WEB-INSTALL`

Status: user-authorized external installation evidence. It updates the current realization record but does not constitute browser interaction acceptance or final realization acceptance.

## User authority

The user authorized installing the current candidate and restarting the service. This authority covered mutation of the local `web` profile and `systemctl restart dsh-web`; it did not add authority to push, publish, uninstall, or overwrite unrelated Harness changes.

## Checked preconditions

The dirty `/root/deepseek-harness` worktree already contained the required `shell.navbar.action`, transient `detailsOpen`, persisted `detailsWidth`, keyed store persistence, and generated catalog declarations. No conflicting sidebar prerequisite was found, so no Harness source file was changed during installation.

The right-sidebar profile dependency already resolved to `link:/root/dsh-right-sidebar`. The standard adapter was absent before this run.

## Installation and startup observations

The Agent rebuilt the shell from source commit `a522fb187a8afef060216f919ec32448caf98129` and rebuilt `@dsh-std/ui-browser` plus `@dsh-std/adapter-dsh` from commit `580b330323c13ec568adab2c35fabf8f8fa6b194`.

`@dsh-std/adapter-dsh` was added to the `web` profile as `link:/root/dsh-std/packages/adapter-dsh`. The profile manifest and dumped bundle configuration then contained both `@dsh-external/dsh-right-sidebar` and `@dsh-std/adapter-dsh` exactly once.

After `systemctl restart dsh-web`, the service became active and `http://127.0.0.1:3082/` returned HTTP 200. The generated boot manifest included both client modules. Their exact module URLs returned HTTP 200 with non-empty bodies: 14,959 bytes for the sidebar and 91,903 bytes for the adapter. The new process journal contained no startup or assembly error; the only `ELIFECYCLE` line belonged to the intentionally stopped previous process.

## Evidence boundary

This run proves local link assembly, server-side discovery, client boot-manifest inclusion, bundle serving, and successful service restart for the current commits. No controllable browser runtime was available, so it does not prove that either client module executed, that the navbar button rendered, that opening/resizing/persistence worked, or that a portable feature view appeared. Those remain browser-level acceptance work.
