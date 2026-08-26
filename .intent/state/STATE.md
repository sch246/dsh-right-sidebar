# DeepSeek Harness right-sidebar intent

Status: draft embedded intent package after an Agent-driven portability refactor. C1 through C6 remain immutable historical implementation, installation and lifecycle evidence. No current realization is selected until this refactor is committed and sealed against a concrete target.

## Intent

Provide a product-quality, default-hidden, full-height right-sidebar platform for DeepSeek Harness Web. It participates in horizontal layout, can be resized while remembering the last width, exposes one global visibility control, permits other plugins to register tabs, and lets a feature share session-scoped state and actions between its main-view and sidebar contributions.

The platform itself supplies no review, terminal, browser, file, Git, tool-detail, session-analysis, or other business feature. That absence is not permission to leave the platform skeletal: registration lifecycle, interaction states, accessibility, responsive behavior, error containment and cross-surface coordination are part of the product.

## Acceptance criteria

- `SIDEBAR-001`: Opening the sidebar creates a full-height layout column that reduces main-content width; closing it leaves the main view unobstructed. This works on the ordinary new-conversation interface before the first message as well as in established conversations.
- `SIDEBAR-002`: One navbar action opens and closes it, stays consistent with actual visibility, does not overlap per-session header utilities, and aligns with the host header controls without a standalone resting border or shadow; the panel does not repeat that visibility control internally. The action must not retain a hidden open state while presenting itself as closed.
- `SIDEBAR-003`: The full-height layout divider resizes it without a separate visible grip; refresh restores the last nonzero width while visibility still starts hidden.
- `SIDEBAR-004`: An external fixture can register, switch, and remove multiple tabs while the platform itself contributes no business tab.
- `SIDEBAR-005`: A fixture using one session-scoped state/action owner from the main view and a sidebar tab observes immediate two-way synchronization and session isolation.
- `SIDEBAR-006`: A cold Agent starting at the host repository can locate this package through the selected protocol bootstrap, inspect the target and any applicable realization, install a conforming implementation, maintain or re-synthesize it after detected drift, and uninstall only its owned contribution. Missing target support leads to investigation and an explicit tension, not silent intent weakening.
- `SIDEBAR-007`: Every required host source change is attributable to a selected realization, bound to a checked target baseline, and removable without erasing unrelated later changes; logical interventions carry nearby source-region ownership markers. Generated aggregations are regenerated from remaining source contributions rather than statically owned by one package, and no second implementation silently shares ownership of the same target effect.
- `SIDEBAR-008`: An empty platform stays visually quiet; tab chrome appears only when contributions exist, while populated, overflow, narrow-width, loading and contribution-failure states remain understandable and usable. Focus, keyboard operation, labels, hit targets and motion follow the host's accessibility and interaction conventions.
- `SIDEBAR-009`: The same sidebar intent can be realized on another host without requiring one shared runtime ABI. A conforming realization preserves the stable registration API below or supplies an Agent-generated adaptation for consumers; target-specific layout, registration and cleanup remain realization details.

## Stable registration API

The DeepSeek Harness realization exposes the public client coordinate `@dsh-external/dsh-right-sidebar/client` and the additive `rightbar.tab` registration seat. An incompatible change to this API is a state revision, not routine lock regeneration.

- `rightbar.tab` is a session-scoped list of independently owned contributions.
- A contribution supplies a stable identity, user-facing label, ordering value and renderable content.
- Multiple plugins can register concurrently. Registration and removal update the visible ledger without discovery-order ownership or last-writer-wins replacement.
- The platform renders one selected contribution at a time, keeps selection session-scoped, and repairs selection when the active contribution disappears.
- Contribution lifetime follows its registering feature. Removal must release its registration, styles, subscriptions and other owned resources.
- The platform contributes no business tab and does not own feature state. A feature may share one session-scoped state/action owner between its main-view and sidebar contributions.

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

- The host repository is currently also the DSH/npm package consumed by the profile `link:` workflow. That is evidence about candidate C1, not a permanent requirement on future portable realizations.
- The selected protocol defines how the embedded semantic package and its bootstrap are discovered; those concrete names are protocol realization, not sidebar intent.
- Local plugin and Harness worktrees are bootstrap evidence only. Local paths and dirty states are not portable acceptance.
- Earlier C2 through C6 experiments used local dsh-std commit `580b330323c13ec568adab2c35fabf8f8fa6b194` to test one portable mapping and lifecycle design. Those frozen locks remain historical evidence, not a current dependency or preferred architecture.

## Current decisions

- Within the sidebar platform scope, completeness and product-quality UX are required. Agent-owned interaction details may be chosen autonomously when they preserve these acceptance effects and introduce no undeclared user-visible trade-off.
- Long-lived changes to official DeepSeek Harness are permitted. Avoiding upstream modification is not a reason to weaken full-height layout, width persistence, extensibility or synchronized state.
- Portability is carried by this state and regenerated per target by an Agent. A shared standard or adapter may be selected inside a realization, but dsh-std is not a required dependency, authority or migration destination.
- API stability is explicit only for the registration semantics in this state. Internal Harness coordinates and mechanisms may change between locks without weakening consumer-visible behavior.
- C2 `a522fb187a8afef060216f919ec32448caf98129` contains loading and failure chrome, retry, focus repair, narrow-width treatment, keyboard focus styling, and a real source-level adapter/slot/shell lifecycle fixture. These are candidate facts, not live-browser or production-loader acceptance.
- C3 records user-authorized installation of that same source plus adapter commit `580b330323c13ec568adab2c35fabf8f8fa6b194` into the live `web` profile. Both local links, boot-manifest entries and served bundles were observed, and `dsh-web` restarted successfully. Client execution and visible interaction remain unobserved.
- Live inspection revised the chrome requirements: reserve room for the global toggle instead of overlapping session utilities, keep the full divider edge draggable without a visible pill, remove the panel-internal collapse/title, and render no empty-state notice or empty tab strip.
- C4 `794ecd03fc9b80619b679b5d33f844f55b786eb9` implements that revision. Component and layout regression suites, client typechecking, patch applicability, public bundle inspection and service restart pass; rendered browser geometry and subjective visual acceptance remain open.
- The user subsequently confirmed C4's visible chrome and requested one refinement: match the Session log control's 32-pixel height and 12-pixel top inset, while removing the sidebar toggle's resting edge and shadow.
- C5 `aa4baa3660f0ab7a06793baf576166340343bd09` implements and publicly serves that alignment refinement. Automated geometry/style assertions and live bundle inspection pass; final rendered appearance awaits user confirmation.
- The user subsequently tested the deployed sidebar, confirmed that it runs and that the current shell iteration can be closed, and authorized pushing this repository. This closes the live shell/visual milestone without treating unexecuted synchronization, lifecycle and adapter-migration acceptance as passed.
- The user subsequently reported that the new-conversation interface could not visibly open the sidebar until after the first message. Investigation confirmed a target layout gate that forced blank-session details width to zero despite recording `detailsOpen: true`; current state requires the global control to work before that message.
- The current source and regenerated Harness patch remove that gate while preserving session-change closure. Focused and complete ui-layout suites, Harness host typechecking, the plugin build/tests and patch applicability checks pass; this evidence is not a live deployment observation.
- The user authorized installation and restart. The existing linked profile was retained, right-sidebar and ui-layout artifacts were rebuilt, and `dsh-web` restarted active. Local HTTP remained healthy. The public root initially returned HTTP 200, while later requests from this host failed during TLS negotiation; the intended browser path was subsequently verified by the user.
- The user then tested the deployed browser interaction and reported success. This closes the new-conversation visibility mismatch and confirms the intended client path reached the restarted deployment; it does not close unrelated synchronization or lifecycle acceptance.
- Realization locks cache concrete versions and evidence. Missing build outputs or an unusable historical environment require re-synthesis from state and current reality, not a weaker sidebar or byte-identical reconstruction.
- Candidate 7 practices compact package-delimited source locators on all logical Harness interventions. Begin lines carry only ordinary `(purpose: ...)` commentary for an Agent; realization identity and removal authority stay in the lock and lifecycle receipt. It excludes shared generated catalogs from the static patch and regenerates them after install or owned uninstall. This is lifecycle design evidence, not adoption or a live deployment claim.
- The reproducible Harness target is official remote commit `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`. Local `b642a106` is a five-commit-ahead skill-enablement assembly context, not remote authority; the current patch applies cleanly to `b150a551` and composes there with preset-manager.

## Constraints and permissions

- Do not infer desired semantics from the current implementation, `PROPOSAL.md`, tests, or successful runtime behavior.
- Do not claim the selected candidate is accepted or lifecycle-safe merely because its source identity is immutable or it passes in one prepared development environment.
- A lock may reference host or target resources, but a mutable locator alone is insufficient: consequential references must bind an immutable identity and declare applicability and ownership scope.
- Harness source changes are allowed but must be attributable and reviewable in the selected realization. Feature components must not use DOM manipulation or Harness-private stores to bypass the stable registration boundary.
- Publishing, pushing, applying source patches, changing a live profile, restarting services, or performing destructive uninstall requires authority for that external action.

## Non-goals

- Implementing any business tab or defining feature-specific message-collapse, jump-target, or session-display semantics.
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
- User live observation now confirms the deployed shell runs and the reported chrome/layout defects are resolved. Automated browser evidence for contributed tabs and main-view/sidebar session synchronization remains incomplete; component tests cover empty, loading, failure/retry, focus repair and keyboard tab navigation.
- Candidate 7 is being prepared as the first lock for the current direct realization. Its source-region attribution and exact patch lifecycle are candidate evidence until an immutable source commit is bound and the candidate bundle is sealed; live install/uninstall evidence remains absent.
- Automated browser evidence for the two-way/session-isolated fixture required by `SIDEBAR-005` remains incomplete.
- Historical C3 install and restart succeeded, but target drift maintenance and owned uninstall have not been rerun for the current direct realization model.
