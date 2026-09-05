# Persistent sidebar maximization and Host ownership

Record ID: `SRC-2026-09-05-RIGHT-SIDEBAR-MAXIMIZATION`

Status: User interaction decision, ownership correction, and local deployment evidence. It advances the current state without accepting a realization.

## Desired interaction

The navbar control follows the supplied Codex references. A closed right sidebar shows one unselected sidebar icon. An open sidebar shows a maximize or restore icon followed by the selected sidebar icon. The bottom-panel icon between those controls in the reference belongs to another surface and is absent here.

Maximization keeps the left session sidebar and gives the right sidebar all remaining application width. Returning to ordinary mode restores its remembered drag width. Closing the sidebar, changing the current session, and reloading the browser do not clear the maximization preference; visibility itself remains transient and starts closed.

The ordinary mode has no fixed maximum drag width. The retained left sidebar and the center column's minimum usable width determine the rendered limit.

## Checked target facts

Harness alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b` had one details visibility action, a fixed 520-pixel details ceiling, and no maximization state. Its layout store already provided the correct ownership point for width and visibility, and its root frame already kept all three columns mounted. The smallest target adaptation therefore extends that layout store and `ctx.layout`; the feature plugin does not mirror geometry or manipulate Host DOM.

The user clarified that this repository has no authority to land changes in DeepSeek Harness upstream. This supersedes only the upstream-modification permission recorded in `2026-08-25-product-quality-and-adapter-direction.md`. Target-specific Harness changes remain an attributable, reversible patch owned by this plugin and may be applied to an explicitly authorized local deployment.

## Decision and state effect

State revision `0.3.0-draft.17` requires the Codex-style control states, unbounded ordinary drag preference, retained-left-sidebar maximization, and persistence of width and maximization independently from visibility. It also treats the tracked Host patch as realization-owned adaptation rather than an upstream DSH contribution.

## Implementation and deployment evidence

Plugin source commit `4839bdafeb75838891db2b86038b1855f248cb4c` supplies the controls and selected-state styling. The tracked Host patch is based on Harness `0a53fb55bea101816fa226bb964ae2bed71c343b`, applies to that clean baseline, and reverses from the synthesized target. Three plugin test files pass 17 tests; five focused Host specifications pass 63 tests; client typechecking, Host bundles, the Web frontend, and the plugin client bundle build successfully.

The local `web` profile retained its existing linked plugin. `dsh-web` restarted active and returned HTTP 200. Browser checks at 1600 pixels observed the closed one-button state, the ordinary two-button state, and the maximized two-button state with both selected controls using the Host ghost-button active fill. Maximized tracks resolved to `280px 0px 1320px`, and the mounted center was inert. Closing and reopening, reloading and reopening, and changing session then reopening each retained maximization. At a 1920-pixel viewport, ordinary dragging rendered a 1000-pixel right sidebar and persisted a 1117-pixel preference, demonstrating removal of the former fixed ceiling.

Global `gen-cordis-api` regeneration remains incomplete because the existing `chat/open-workspace-file` event fails its unrelated rendering-projection partition check. The client slot catalog regenerated, the affected source and bundles compiled, and the local installation receipt names the deferred catalog instead of claiming it was produced.
