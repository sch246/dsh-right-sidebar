# DeepSeek Harness right-sidebar intent

Status: draft embedded intent package with no selected candidate after the [tab-menu removal](../logs/2026-09-06-remove-tab-menu.md). [Deployment evidence](../logs/2026-09-06-compact-ui-activation.md) records the preceding tab-gesture installation. Historical locks remain immutable evidence. No realization is user-accepted or promoted to an active lock.

## Intent

Provide a product-quality, default-hidden, full-height right-sidebar workbench for DeepSeek Harness Web. It participates in horizontal layout, has an ordinary resizable mode without a fixed maximum width, can maximize into all space after the left sidebar, remembers width and maximization independently from visibility, exposes global navbar controls, and permits other plugins to register launchers and static views in a session-retained grouped workspace.

The platform itself supplies no review, terminal, browser, file, Git, tool-detail, session-analysis, or other business feature. That absence is not permission to leave the platform skeletal: registration lifecycle, interaction states, accessibility, responsive behavior, error containment and cross-surface coordination are part of the product.

## Acceptance criteria

- `SIDEBAR-001`: Opening the sidebar creates a full-height layout column that reduces main-content width; closing it leaves the main view unobstructed. This works on the ordinary new-conversation interface before the first message as well as in established conversations.
- `SIDEBAR-002`: A closed sidebar shows one unselected navbar icon. An open sidebar shows a maximize or restore icon followed by the selected sidebar icon; that sidebar icon closes it. The controls stay consistent with actual visibility, do not overlap per-session header utilities, and align with Host header controls without a standalone resting border or shadow. The platform does not add the unrelated bottom-panel control from the visual reference and does not repeat visibility controls inside the panel.
- `SIDEBAR-003`: The full-height layout divider resizes ordinary mode without a separate visible grip or fixed maximum width; the retained left sidebar and center minimum determine the rendered limit. Refresh restores the last ordinary width while visibility still starts hidden.
- `SIDEBAR-004`: External fixtures can register launchers, static view renderers and restoration callbacks, then open, preview, pin, move, switch, rename and close instances, while the platform itself contributes no business launcher or view.
- `SIDEBAR-005`: Each session retains one layout tree containing split ratios, leaf groups, tab order and active selection across mounted-session changes and browser reload without a second state mirror. Switching sessions preserves the Host-owned open state as well as width and maximization; browser reload still starts with the sidebar hidden.
- `SIDEBAR-006`: A cold Agent starting at the host repository can locate this package through the selected protocol bootstrap, inspect the target and any applicable realization, install a conforming implementation, maintain or re-synthesize it after detected drift, and uninstall only its owned contribution. Missing target support leads to investigation and an explicit tension, not silent intent weakening.
- `SIDEBAR-007`: Every required host source change is attributable to a selected realization, bound to a checked target baseline, and removable without erasing unrelated later changes; logical interventions carry nearby source-region ownership markers. Generated aggregations are regenerated from remaining source contributions rather than statically owned by one package, and no second implementation silently shares ownership of the same target effect.
- `SIDEBAR-008`: The launcher home is shown when the active group has no active instance. Group tabs scroll independently from fixed group actions and Host controls, and populated, overflow, narrow-width, loading, missing-restorer and contribution-failure states remain understandable and usable. Focus, keyboard operation, labels, close actions, hit targets and motion follow the host's accessibility and interaction conventions.
- `SIDEBAR-009`: The same sidebar intent can be realized on another host without requiring one shared runtime ABI. A conforming realization preserves the stable client API below or supplies an Agent-generated adaptation for consumers; target-specific layout, registration and cleanup remain realization details.
- `SIDEBAR-010`: An external client can register a launcher and create, activate, place, preview, pin, rename, switch or close workbench instances without receiving Host layout state. Opening validates the mounted session, live view registration and JSON-safe restoration descriptor before changing instance state or layout; replaced or disposed bindings cannot keep acting on an old session.
- `SIDEBAR-011`: Maximization retains the left session sidebar, sets the center track to zero, keeps its subtree mounted but non-interactive, and assigns all remaining application width to details. Closing, changing session, and browser reload preserve the maximization preference; reopening restores it, while restore returns to the remembered ordinary width.
- `SIDEBAR-012`: Each group has at most one replaceable italic preview. Double-click and the first feature edit pin it. Preview replacement honors asynchronous close vetoes, and a superseded completion cannot replace or activate content selected by a later request.
- `SIDEBAR-013`: Only a group's content rectangle participates in docking: its outer ten percent creates a half-area split on the selected edge and its center joins that group. Content hover previews stay inside that rectangle without changing layout; the content's left edge remains available beside a vertical rail. The complete tab bar, including fixed actions and empty space, only chooses insertion order within or across groups. A dark insertion line marks the exact slot, horizontal for vertical tabs and vertical for horizontal tabs; no content overlay covers a tab bar. Internal tab drags never enter feature-editor text or file drop handlers, while external editor drops remain untouched. Split dividers resize freely, remain recoverable at extremes and have no fixed maximum.
- `SIDEBAR-014`: Every group switches between horizontal tabs and a vertical tab rail whose width can be resized, while retaining that rail width. Vertical titles, icons, launcher and orientation controls align to the left. Horizontal tab lists scroll horizontally with ordinary or Shift-modified wheel input and trackpad deltaX, preserve Ctrl zoom, and intercept wheel events only when the list actually scrolls. New sessions and groups use a horizontal default unless the session preference changes. Layout switching, tab movement and resizing have keyboard alternatives and never obscure global sidebar controls.
- `SIDEBAR-015`: Reloaded instances remain in their saved group and order as restoring, missing or failed placeholders until their renderer and generic restorer are available. Restoration exceptions are visible and retryable. Missing registrations never erase persisted layout or instance descriptors.

## Stable client API

The DeepSeek Harness realization exposes the public client coordinate `@dsh-external/dsh-right-sidebar/client` and the additive session-scoped `rightbar.view` registration seat. Each renderer keeps the owner props `{ instanceId }`; callers obtain group location through the service rather than a Host catalog change. An incompatible change to this API is a state revision, not routine lock regeneration.

The service provides launcher registration and invocation; generic restorer registration by renderer id; asynchronous `openInstance()` with optional target and preview fields; `getInstanceGroup()` and pure `resolveTarget()` lookup; activation, pinning, title and restoration-checkpoint update, same-id renderer switch; and asynchronous close. `openInstance()` returns the actual destination group id. Relative targets contain a source instance and `center`, `left`, `right`, `up`, or `down`; explicit targets contain a group id.

The runtime is the sole authority for each session's layout tree. Leaf groups own ordered instances, one active instance, tab orientation and retained vertical-rail width. Split branches own ratios. The session snapshot owns the active group and default tab orientation. Geometry and horizontal or vertical presentation are derived from this tree, never mirrored as another ledger.

Opening validates the mounted session, live view and JSON-safe restoration descriptor before changing layout or instances. An existing id retains its renderer and title, becomes active and is pinned by a non-preview open. Relative resolution chooses an existing directional leaf by nearest geometry and tree preorder; absent directional targets create an equal split. Preview replacement awaits the old preview close decision. Veto rejects with `preview-vetoed`; a later open invalidates an older completion with `superseded`.

`switchInstanceView()` preserves instance id, group, order and preview state while replacing the validated renderer, title, descriptor and close callbacks. Feature services decide whether switching incompatible document models requires save, discard or cancellation. Moving a tab pins it; center placement inserts in the destination group and edge placement creates an equal split. Empty non-root groups collapse.

Persistent storage contains only versioned JSON layout, instance metadata and feature-owned restoration descriptors. A registered restorer receives session id, instance id and its opaque descriptor, reconstructs feature state, and may return runtime-only close callbacks plus `onRestored`. The runtime invokes `onRestored` synchronously only after that exact restoration is committed ready with its close callbacks installed, so features can flush state discovered during restoration without timer ordering. Stale, failed, unregistered or disposed restorations do not invoke it; notification exceptions are reported without rolling back ready state. Missing renderers or restorers retain visible placeholders. Restoration rejection retains a retryable failed placeholder. Registration cleanup never deletes persisted instances.

`closeInstance()` coalesces concurrent decisions for the same instance object, honors an asynchronous `false` veto and preserves callback rejection. `onClose` only decides; synchronous `onClosed` releases feature state after authoritative removal. Object identity prevents an older completion from removing an updated, switched, moved, restored or reopened instance, and those stale operations never call `onClosed`. Notification exceptions are reported without rolling back the committed layout. Removing the active instance selects its next neighbor, then its previous neighbor, then launcher home.

Public validation uses `RightSidebarError` with stable codes `not-mounted`, `session-mismatch`, `unknown-launcher`, `duplicate-launcher`, `duplicate-restorer`, `unknown-view`, `unknown-instance`, `unknown-group`, `preview-vetoed`, `superseded`, `invalid-restore-descriptor` and `disposed`. Validation failures occur before instance or Host layout writes.

The service binding follows the mounted details occurrence. A replacement binding invalidates the prior one, panel unmount removes its binding, and plugin disposal removes both binding and service. Layout width, visibility and maximization remain Host-owned. The platform contributes no business launcher, view or feature-specific document state.

## Agent-driven realization lifecycle

State is sufficient to regenerate a baseline-conforming implementation; a lock caches one concrete, reproducible realization and may improve consistency without becoming semantic authority.

For installation, maintenance or migration, the Agent must:

1. read this state, its source logs and the selected protocol before treating code or documentation as intent;
2. inspect the current host for native sidebar/layout/registration capabilities and compare any candidate lock's source, target, protocol and applicability bindings;
3. choose the smallest target-specific implementation that satisfies the acceptance criteria and stable API, reusing host behavior where that preserves its authority;
4. translate missing capabilities, conflicts or user-visible compromises into a tension before changing state;
5. build and test the chosen realization, then record immutable source/target identities, governed paths, installation commands, ownership and bounded evidence in its lock;
6. install or restart external systems only with authority, and verify the declared profile/runtime effects rather than inferring success from compilation;
7. on drift, re-investigate and re-synthesize instead of force-applying stale changes; on uninstall, remove only attributable effects and preserve unrelated later changes.

Exact commands, local paths, profile representation, target commits and patch procedures belong to the selected realization lock because hosts and versions may differ.

## Resources

- The selected protocol defines how the embedded semantic package and its bootstrap are discovered; those concrete names are protocol realization, not sidebar intent.
- Local plugin and Harness worktrees are bootstrap evidence only. Local paths, dirty states and profile links are not portable acceptance.
- The current recomposition target is the official Harness `dsh-v0.1.2-alpha.2` release commit `0a53fb55bea101816fa226bb964ae2bed71c343b`. It is a target binding, not a selected realization.

## Current decisions

- Within the sidebar platform scope, completeness and product-quality UX are required. Agent-owned interaction details may be chosen autonomously when they preserve these acceptance effects and introduce no undeclared user-visible trade-off.
- Tabs expose their title and close action without a three-dot button or pin, move or split popup menu. Dragging supplies placement; double-click pins previews, and existing keyboard shortcuts remain available.
- This repository has no authority to land changes in DeepSeek Harness upstream. A realization may carry an attributable, reversible Host patch and apply it to an explicitly authorized local deployment without presenting that patch as an upstream DSH contribution.
- Portability is carried by this state and regenerated per target by an Agent. A shared standard or adapter may be selected inside a realization, but dsh-std is not a required dependency, authority or migration destination.
- API stability is explicit for the launcher, instance and static view semantics in this state. Internal Harness coordinates and mechanisms may change between locks without weakening consumer-visible behavior.
- Navbar interaction follows the Codex references: closed has one sidebar icon; ordinary open has maximize plus the selected sidebar icon; maximized has restore plus the selected sidebar icon. Width and maximization are durable preferences, while visibility is transient.
- The top-right leaf group reserves Host controls through `--dsh-shell-navbar-width`. Its horizontal tabs share the Host control row; vertical tabs and content retain local clearance. Other leaf groups use compact local chrome. The platform does not register a default launcher or instance.
- Relative group targeting is centralized: geometric distance selects the nearest group and tree preorder breaks ties. A missing directional group is created as an equal split only by the open operation.
- Default tab orientation is a per-session preference for newly created groups. Each group retains its current orientation and vertical rail width independently from the Host-owned outer width and its ancestor split ratios.
- Realization locks cache concrete implementations and evidence. Missing outputs, unavailable references or target drift require re-synthesis from state and current reality, not a weaker sidebar or byte-identical reconstruction.

## Constraints and permissions

- Do not infer desired semantics from the current implementation, `PROPOSAL.md`, tests, or successful runtime behavior.
- Do not claim the selected candidate is accepted or lifecycle-safe merely because its source identity is immutable or it passes in one prepared development environment.
- A lock may reference host or target resources, but a mutable locator alone is insufficient: consequential references must bind an immutable identity and declare applicability and ownership scope.
- Harness source adaptation must stay attributable, reviewable, and reversible inside the selected realization; this repository cannot claim upstream DSH modification authority. Feature components must not use DOM manipulation or Harness-private stores to bypass the stable registration boundary.
- Publishing, pushing, applying source patches, changing a live profile, restarting services, or performing destructive uninstall requires authority for that external action.

## Non-goals

- Implementing any business launcher or view, or defining feature-specific editor, selector, message-collapse, jump-target or session-display semantics.
- Replacing DSH's package manifest, profile bundle format, or pnpm link mechanism with the intent package.
- Requiring every referenced implementation byte to be copied into a lock bundle.
- Defining the protocol-wide embedded-package discovery or immutable-reference model inside this sidebar package.
- Requiring one cross-host runtime ABI, dsh-std installation or Agent-free binary interoperability.

## Implementation hints

- The first as-built realization binds a frozen implementation commit and an explicit set of repository-relative governed paths while excluding semantic package state from the implementation identity boundary.
- External upstream and Harness references should prefer immutable Git commits when available.
- Prefer a host's native layout and registration capabilities when they satisfy state. Generate a bounded adapter or source change only where the target requires one, and keep that choice inside the target realization lock.

## Open tensions

- Whether DSH or this realization should own cleanup of the orphan `link:` symlink left after `dsh plugin remove`; manifest, lockfile, bundle configuration, and runtime dump are already clean at that point.
- Global Cordis API catalog regeneration is blocked by the existing `chat/open-workspace-file` rendering-projection partition violation. A future candidate cannot claim the complete catalog workflow until that feature resolves the violation.
- Target-drift maintenance and owned uninstall have not been exercised for a grouped-workbench realization.
