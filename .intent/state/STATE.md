# DeepSeek Harness right-sidebar intent

Status: draft embedded intent package with no selected realization. Existing locks remain immutable historical implementation, installation and lifecycle evidence. No realization is active or accepted.

## Intent

Provide a product-quality, default-hidden, full-height right-sidebar workbench for DeepSeek Harness Web. It participates in horizontal layout, has an ordinary resizable mode without a fixed maximum width, can maximize into all space after the left sidebar, remembers width and maximization independently from visibility, exposes global navbar controls, and permits other plugins to register launchers and static views that create multiple session-retained editor or selector instances.

The platform itself supplies no review, terminal, browser, file, Git, tool-detail, session-analysis, or other business feature. That absence is not permission to leave the platform skeletal: registration lifecycle, interaction states, accessibility, responsive behavior, error containment and cross-surface coordination are part of the product.

## Acceptance criteria

- `SIDEBAR-001`: Opening the sidebar creates a full-height layout column that reduces main-content width; closing it leaves the main view unobstructed. This works on the ordinary new-conversation interface before the first message as well as in established conversations.
- `SIDEBAR-002`: A closed sidebar shows one unselected navbar icon. An open sidebar shows a maximize or restore icon followed by the selected sidebar icon; that sidebar icon closes it. The controls stay consistent with actual visibility, do not overlap per-session header utilities, and align with Host header controls without a standalone resting border or shadow. The platform does not add the unrelated bottom-panel control from the visual reference and does not repeat visibility controls inside the panel.
- `SIDEBAR-003`: The full-height layout divider resizes ordinary mode without a separate visible grip or fixed maximum width; the retained left sidebar and center minimum determine the rendered limit. Refresh restores the last ordinary width while visibility still starts hidden.
- `SIDEBAR-004`: External fixtures can register launchers and static view renderers, open multiple ordered instances, switch, rename and close them, while the platform itself contributes no business launcher or view.
- `SIDEBAR-005`: Each session retains its own ordered instances and active selection across mounted-session changes without a second state mirror.
- `SIDEBAR-006`: A cold Agent starting at the host repository can locate this package through the selected protocol bootstrap, inspect the target and any applicable realization, install a conforming implementation, maintain or re-synthesize it after detected drift, and uninstall only its owned contribution. Missing target support leads to investigation and an explicit tension, not silent intent weakening.
- `SIDEBAR-007`: Every required host source change is attributable to a selected realization, bound to a checked target baseline, and removable without erasing unrelated later changes; logical interventions carry nearby source-region ownership markers. Generated aggregations are regenerated from remaining source contributions rather than statically owned by one package, and no second implementation silently shares ownership of the same target effect.
- `SIDEBAR-008`: The launcher home is shown when no instance is active. The compact tab row keeps its launcher and Host controls fixed while labels scroll, and populated, overflow, narrow-width, loading and contribution-failure states remain understandable and usable. Focus, keyboard operation, labels, close actions, hit targets and motion follow the host's accessibility and interaction conventions.
- `SIDEBAR-009`: The same sidebar intent can be realized on another host without requiring one shared runtime ABI. A conforming realization preserves the stable client API below or supplies an Agent-generated adaptation for consumers; target-specific layout, registration and cleanup remain realization details.
- `SIDEBAR-010`: An external client can register a launcher and create, activate, rename or close workbench instances without receiving Host layout state. Opening validates the mounted session and live view registration before changing instance state or layout; replaced or disposed bindings cannot keep acting on an old session.
- `SIDEBAR-011`: Maximization retains the left session sidebar, sets the center track to zero, keeps its subtree mounted but non-interactive, and assigns all remaining application width to details. Closing, changing session, and browser reload preserve the maximization preference; reopening restores it, while restore returns to the remembered ordinary width.

## Stable client API

The DeepSeek Harness realization exposes the public client coordinate `@dsh-external/dsh-right-sidebar/client` and the additive session-scoped `rightbar.view` registration seat. An incompatible change to this API is a state revision, not routine lock regeneration.

- Each `rightbar.view` registration supplies a stable renderer id. The active instance selects that renderer, and the platform passes its opaque `instanceId` as owner props.
- Multiple plugins can register static renderers concurrently. Registration lifetime follows the contributing feature; removal immediately deletes every session instance that selects the absent renderer without invoking its close veto.
- The platform contributes no business launcher or view and does not own feature-specific editor, selector or document state.

The same public client coordinate merges `ctx.rightSidebar` into Cordis `Context` with these methods: `registerLauncher({ id, label, open })`, `launch(sessionId, launcherId, selection?)`, `openInstance(sessionId, { id, viewId, title, onClose? })`, `activateInstance(sessionId, id)`, `updateInstance(sessionId, id, { title? })`, and `closeInstance(sessionId, id)`. Launcher registration returns its disposer, `launch` and `closeInstance` are asynchronous, and the remaining operations return `void`.

The runtime is the sole authority for each session's ordered instance ledger and active instance. `openInstance` validates the live view ledger and mounted session before side effects, deduplicates an existing id without replacing its fields, activates the instance and reveals the details column. The launcher home is selected when no instance is active; opening it does not remove instances.

`closeInstance` coalesces concurrent closes of the same instance, honors an asynchronous `false` veto and preserves callback rejection. Completion removes only the exact instance that began closing; update, registration cleanup or reopening the same id makes an older completion stale. Removing the active instance selects its next surviving neighbor, then its previous neighbor, then launcher home.

Public validation uses `RightSidebarError` with stable codes `not-mounted`, `session-mismatch`, `unknown-launcher`, `duplicate-launcher`, `unknown-view`, `unknown-instance` and `disposed`. Validation failures occur before instance or layout writes.

The service binding follows the mounted details occurrence. A replacement binding invalidates the prior one, panel unmount removes its binding, and plugin disposal removes both the binding and service. A retained stale service or injected callback cannot mutate a disposed runtime. Layout width, visibility and maximization remain Host-owned.

Exact Harness owner slots, layout stores, injection services, component prop machinery and patch locations are not part of this stable API. Another host may expose an equivalent native contract or use an Agent-generated adapter while preserving these semantics.

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
- This repository has no authority to land changes in DeepSeek Harness upstream. A realization may carry an attributable, reversible Host patch and apply it to an explicitly authorized local deployment without presenting that patch as an upstream DSH contribution.
- Portability is carried by this state and regenerated per target by an Agent. A shared standard or adapter may be selected inside a realization, but dsh-std is not a required dependency, authority or migration destination.
- API stability is explicit for the launcher, instance and static view semantics in this state. Internal Harness coordinates and mechanisms may change between locks without weakening consumer-visible behavior.
- Navbar interaction follows the Codex references: closed has one sidebar icon; ordinary open has maximize plus the selected sidebar icon; maximized has restore plus the selected sidebar icon. Width and maximization are durable preferences, while visibility is transient.
- The tab row reserves Host controls through `--dsh-shell-navbar-width`; instance labels scroll independently while the launcher remains fixed. The platform does not register a default launcher or instance.
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
- Automated browser evidence for multi-instance launcher, editor and session-retention behavior remains incomplete.
- Target-drift maintenance and owned uninstall have not been exercised for a multi-instance realization.
