# DeepSeek Harness right-sidebar intent

Status: draft embedded intent package with one selected candidate realization. The candidate is implementation evidence, not an accepted realization.

## Intent

Provide a default-hidden, full-height right-sidebar platform for DeepSeek Harness Web. It participates in horizontal layout, can be resized while remembering the last width, exposes global and internal visibility controls, permits other plugins to register tabs, and lets a feature share session-scoped state and actions between its main-view and sidebar contributions.

The platform itself supplies no review, terminal, browser, file, Git, tool-detail, session-analysis, or other business feature.

## Acceptance criteria

- `SIDEBAR-001`: Opening the sidebar creates a full-height layout column that reduces main-content width; closing it leaves the main view unobstructed.
- `SIDEBAR-002`: A navbar action opens and closes it, an internal action collapses it, and both remain consistent with actual visibility.
- `SIDEBAR-003`: The layout divider resizes it; refresh restores the last nonzero width while visibility still starts hidden.
- `SIDEBAR-004`: An external fixture can register, switch, and remove multiple tabs while the platform itself contributes no business tab.
- `SIDEBAR-005`: A fixture using one session-scoped state/action owner from the main view and a sidebar tab observes immediate two-way synchronization and session isolation.
- `SIDEBAR-006`: A cold Agent starting at the host repository can locate this package through the selected protocol bootstrap, check a realization and its target bindings, install the linked DSH checkout, maintain it after detected drift, and uninstall only its owned contribution.
- `SIDEBAR-007`: Every required Harness source change is attributable to the realization, bound to a checked target baseline, and removable without erasing unrelated later changes.

## Resources

- The host repository is also the DSH/npm package consumed by the profile `link:` workflow.
- The selected protocol defines how the embedded semantic package and its bootstrap are discovered; those concrete names are protocol realization, not sidebar intent.
- Local plugin and Harness worktrees are bootstrap evidence only. Local paths and dirty states are not portable acceptance.

## Constraints and permissions

- Do not infer desired semantics from the current implementation, `PROPOSAL.md`, tests, or successful runtime behavior.
- Do not claim the selected candidate is accepted or lifecycle-safe merely because its source identity is immutable or it passes in one prepared development environment.
- A lock may reference host or target resources, but a mutable locator alone is insufficient: consequential references must bind an immutable identity and declare applicability and ownership scope.
- Prefer public Harness services and reversible plugin lifecycle. Do not use DOM manipulation or private stores to create hidden coupling to the main interface.
- Publishing, pushing, applying source patches, changing a live profile, restarting services, or performing destructive uninstall requires authority for that external action.

## Non-goals

- Implementing any business tab or defining feature-specific message-collapse, jump-target, or session-display semantics.
- Replacing DSH's package manifest, profile bundle format, or pnpm link mechanism with the intent package.
- Requiring every referenced implementation byte to be copied into a lock bundle.
- Defining the protocol-wide embedded-package discovery or immutable-reference model inside this sidebar package.

## Implementation hints

- The first as-built realization binds a frozen implementation commit and an explicit set of repository-relative governed paths while excluding semantic package state from the implementation identity boundary.
- External upstream and Harness references should prefer immutable Git commits when available.

## Open tensions

- Which current user-visible behaviors are intended semantics versus provisional choices in the existing implementation.
- How the build dependency closure is made retrievable and reproducible: the frozen plugin and Harness source commits do not contain the prepared vendored/package build outputs currently required by `scripts/build.sh`.
- Whether DSH or this realization should own cleanup of the orphan `link:` symlink left after `dsh plugin remove`; manifest, lockfile, bundle configuration, and runtime dump are already clean at that point.
- Full browser acceptance and external fixtures for tab registration plus main-view/sidebar session synchronization remain incomplete.
- How a future protocol should machine-check a realization that contributes to both the plugin repository and a separate Harness target rather than treating the second target as manifest-only evidence.
