# DeepSeek Harness right-sidebar intent

Status: draft embedded intent package with one selected candidate realization. The candidate is implementation evidence, not an accepted realization.

## Intent

Provide a product-quality, default-hidden, full-height right-sidebar platform for DeepSeek Harness Web. It participates in horizontal layout, can be resized while remembering the last width, exposes global and internal visibility controls, permits other plugins to register tabs, and lets a feature share session-scoped state and actions between its main-view and sidebar contributions.

The platform itself supplies no review, terminal, browser, file, Git, tool-detail, session-analysis, or other business feature. That absence is not permission to leave the platform skeletal: registration lifecycle, interaction states, accessibility, responsive behavior, error containment and cross-surface coordination are part of the product.

## Acceptance criteria

- `SIDEBAR-001`: Opening the sidebar creates a full-height layout column that reduces main-content width; closing it leaves the main view unobstructed.
- `SIDEBAR-002`: A navbar action opens and closes it, an internal action collapses it, and both remain consistent with actual visibility.
- `SIDEBAR-003`: The layout divider resizes it; refresh restores the last nonzero width while visibility still starts hidden.
- `SIDEBAR-004`: An external fixture can register, switch, and remove multiple tabs while the platform itself contributes no business tab.
- `SIDEBAR-005`: A fixture using one session-scoped state/action owner from the main view and a sidebar tab observes immediate two-way synchronization and session isolation.
- `SIDEBAR-006`: A cold Agent starting at the host repository can locate this package through the selected protocol bootstrap, check a realization and its target bindings, install it into a target DSH profile, maintain it after detected drift, and uninstall only its owned contribution.
- `SIDEBAR-007`: Every required Harness source change is attributable to a selected adapter realization, bound to a checked target baseline, and removable without erasing unrelated later changes; the sidebar component does not become a second owner of the same mapping.
- `SIDEBAR-008`: Empty, populated, overflow, narrow-width, loading and contribution-failure states remain understandable and usable; focus, keyboard operation, labels, hit targets and motion follow the host's accessibility and interaction conventions.
- `SIDEBAR-009`: A portable external component can consume the sidebar surface without importing Harness-private types or stores. Harness-specific registration, layout and cleanup live behind one adapter owner, and replacing that adapter after a Harness update does not require changing a conforming component when the surface contract is unchanged.

## Resources

- The host repository is currently also the DSH/npm package consumed by the profile `link:` workflow. That is evidence about candidate C1, not a permanent requirement on future portable realizations.
- The selected protocol defines how the embedded semantic package and its bootstrap are discovered; those concrete names are protocol realization, not sidebar intent.
- Local plugin and Harness worktrees are bootstrap evidence only. Local paths and dirty states are not portable acceptance.
- `Yan-Zero/dsh-std` commit `bb194ad53a72f4fa7da1286c88dcebb488b43eb9` is evidence for the preferred DSH product-adapter boundary. It does not yet implement the required right-sidebar surface.

## Current decisions

- Within the sidebar platform scope, completeness and product-quality UX are required. Agent-owned interaction details may be chosen autonomously when they preserve these acceptance effects and introduce no undeclared user-visible trade-off.
- Long-lived changes to official DeepSeek Harness are permitted. Avoiding upstream modification is not a reason to weaken full-height layout, width persistence, extensibility or synchronized state.
- The desired long-term responsibility boundary places Harness-private mapping in `@dsh-std/adapter-dsh` and keeps portable sidebar consumers on a surface contract. The existing sidebar-owned patch is a bounded transition until that path works end to end.
- Realization locks cache concrete versions and evidence. Missing build outputs or an unusable historical environment require re-synthesis from state and current reality, not a weaker sidebar or byte-identical reconstruction.

## Constraints and permissions

- Do not infer desired semantics from the current implementation, `PROPOSAL.md`, tests, or successful runtime behavior.
- Do not claim the selected candidate is accepted or lifecycle-safe merely because its source identity is immutable or it passes in one prepared development environment.
- A lock may reference host or target resources, but a mutable locator alone is insufficient: consequential references must bind an immutable identity and declare applicability and ownership scope.
- Harness source changes are allowed but must be attributable, reviewable and concentrated in the shared adapter boundary. Portable components must not use DOM manipulation or Harness-private stores to create hidden coupling.
- Publishing, pushing, applying source patches, changing a live profile, restarting services, or performing destructive uninstall requires authority for that external action.

## Non-goals

- Implementing any business tab or defining feature-specific message-collapse, jump-target, or session-display semantics.
- Replacing DSH's package manifest, profile bundle format, or pnpm link mechanism with the intent package.
- Requiring every referenced implementation byte to be copied into a lock bundle.
- Defining the protocol-wide embedded-package discovery or immutable-reference model inside this sidebar package.

## Implementation hints

- The first as-built realization binds a frozen implementation commit and an explicit set of repository-relative governed paths while excluding semantic package state from the implementation identity boundary.
- External upstream and Harness references should prefer immutable Git commits when available.
- Introduce the portable right-sidebar surface and its Harness mapping in `@dsh-std/adapter-dsh`; manage that adapter contribution as a separate intent package whose lock can be regenerated against new Harness revisions.

## Open tensions

- Whether DSH or this realization should own cleanup of the orphan `link:` symlink left after `dsh plugin remove`; manifest, lockfile, bundle configuration, and runtime dump are already clean at that point.
- Full browser acceptance, product-quality UX coverage and external fixtures for tab registration plus main-view/sidebar session synchronization remain incomplete.
- The exact portable sidebar surface, adapter mapping and migration from the direct sidebar-owned Harness patch remain unrealized. The transition ends when an external component passes `SIDEBAR-004`, `SIDEBAR-005`, `SIDEBAR-008` and `SIDEBAR-009` through `@dsh-std/adapter-dsh` and the direct patch can be removed.
- How the adapter intent package records and machine-checks its Harness target, installed effects and removal ownership without making those implementation details part of this sidebar's semantic authority.
