# Remove the obsolete dsh-std runtime adapter

Record ID: `SRC-2026-08-27-DSH-STD-RUNTIME-REMOVAL`

Status: user-authorized realization cleanup. It does not revise right-sidebar semantics or the selected intent-package protocol.

The current right-sidebar implementation owns and exports the Harness-specific `rightbar.tab` registration API directly. Preset-manager and skill-manager are also independently packaged, and checked source search found no consumer of the older `dsh/browser/sidebar-view` participant outside `/root/dsh-std` itself. The Web profile nevertheless continued to load `@dsh-std/adapter-dsh` through a local link.

The user authorized removing that profile bundle and deleting the local `/root/dsh-std` checkout. This is a direct cutover from an unused compatibility path, not an uninstall of right-sidebar, preset-manager or skill-manager and not authority to remove their separately marked Harness contributions.

Removal evidence must confirm that the Web profile and dumped runtime configuration no longer contain the adapter identity, the independent plugins remain installed, the composed Harness build passes, and the Web service restarts. The local checkout should be removed recoverably so historical unpushed experiment bytes are not immediately destroyed.
