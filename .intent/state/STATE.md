# DeepSeek Harness right-sidebar intent

Status: draft embedded intent package awaiting the navbar-alignment refinement. Retained C1 through C4 locks are historical implementation, installation and lifecycle evidence, not current acceptance.

## Intent

Provide a product-quality, default-hidden, full-height right-sidebar platform for DeepSeek Harness Web. It participates in horizontal layout, can be resized while remembering the last width, exposes one global visibility control, permits other plugins to register tabs, and lets a feature share session-scoped state and actions between its main-view and sidebar contributions.

The platform itself supplies no review, terminal, browser, file, Git, tool-detail, session-analysis, or other business feature. That absence is not permission to leave the platform skeletal: registration lifecycle, interaction states, accessibility, responsive behavior, error containment and cross-surface coordination are part of the product.

## Acceptance criteria

- `SIDEBAR-001`: Opening the sidebar creates a full-height layout column that reduces main-content width; closing it leaves the main view unobstructed.
- `SIDEBAR-002`: One navbar action opens and closes it, stays consistent with actual visibility, does not overlap per-session header utilities, and aligns with the host header controls without a standalone resting border or shadow; the panel does not repeat that visibility control internally.
- `SIDEBAR-003`: The full-height layout divider resizes it without a separate visible grip; refresh restores the last nonzero width while visibility still starts hidden.
- `SIDEBAR-004`: An external fixture can register, switch, and remove multiple tabs while the platform itself contributes no business tab.
- `SIDEBAR-005`: A fixture using one session-scoped state/action owner from the main view and a sidebar tab observes immediate two-way synchronization and session isolation.
- `SIDEBAR-006`: A cold Agent starting at the host repository can locate this package through the selected protocol bootstrap, check a realization and its target bindings, install it into a target DSH profile, maintain it after detected drift, and uninstall only its owned contribution.
- `SIDEBAR-007`: Every required Harness source change is attributable to a selected adapter realization, bound to a checked target baseline, and removable without erasing unrelated later changes; the sidebar component does not become a second owner of the same mapping.
- `SIDEBAR-008`: An empty platform stays visually quiet; tab chrome appears only when contributions exist, while populated, overflow, narrow-width, loading and contribution-failure states remain understandable and usable. Focus, keyboard operation, labels, hit targets and motion follow the host's accessibility and interaction conventions.
- `SIDEBAR-009`: A portable external component can consume the sidebar surface without importing Harness-private types or stores. Harness-specific registration, layout and cleanup live behind one adapter owner, and replacing that adapter after a Harness update does not require changing a conforming component when the surface contract is unchanged.

## Resources

- The host repository is currently also the DSH/npm package consumed by the profile `link:` workflow. That is evidence about candidate C1, not a permanent requirement on future portable realizations.
- The selected protocol defines how the embedded semantic package and its bootstrap are discovered; those concrete names are protocol realization, not sidebar intent.
- Local plugin and Harness worktrees are bootstrap evidence only. Local paths and dirty states are not portable acceptance.
- Local dsh-std commit `580b330323c13ec568adab2c35fabf8f8fa6b194`, based on `Yan-Zero/dsh-std`, is the selected portable `SidebarView` and DSH mapping candidate. It implements source-level mapping and session render context, but not the visible shell owner, production loading, or complete acceptance.

## Current decisions

- Within the sidebar platform scope, completeness and product-quality UX are required. Agent-owned interaction details may be chosen autonomously when they preserve these acceptance effects and introduce no undeclared user-visible trade-off.
- Long-lived changes to official DeepSeek Harness are permitted. Avoiding upstream modification is not a reason to weaken full-height layout, width persistence, extensibility or synchronized state.
- The desired long-term responsibility boundary places Harness-private mapping in `@dsh-std/adapter-dsh` and keeps portable sidebar consumers on a surface contract. Standard commit `580b330323c13ec568adab2c35fabf8f8fa6b194` supplies the current `SidebarView` candidate and a portable `sessionId` render key; this package remains the external shell owner during the bounded transition.
- C2 `a522fb187a8afef060216f919ec32448caf98129` contains loading and failure chrome, retry, focus repair, narrow-width treatment, keyboard focus styling, and a real source-level adapter/slot/shell lifecycle fixture. These are candidate facts, not live-browser or production-loader acceptance.
- C3 records user-authorized installation of that same source plus adapter commit `580b330323c13ec568adab2c35fabf8f8fa6b194` into the live `web` profile. Both local links, boot-manifest entries and served bundles were observed, and `dsh-web` restarted successfully. Client execution and visible interaction remain unobserved.
- Live inspection revised the chrome requirements: reserve room for the global toggle instead of overlapping session utilities, keep the full divider edge draggable without a visible pill, remove the panel-internal collapse/title, and render no empty-state notice or empty tab strip.
- C4 `794ecd03fc9b80619b679b5d33f844f55b786eb9` implements that revision. Component and layout regression suites, client typechecking, patch applicability, public bundle inspection and service restart pass; rendered browser geometry and subjective visual acceptance remain open.
- The user subsequently confirmed C4's visible chrome and requested one refinement: match the Session log control's 32-pixel height and 12-pixel top inset, while removing the sidebar toggle's resting edge and shadow.
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
- Full browser execution and interaction acceptance, layout behavior, and main-view/sidebar session synchronization remain incomplete. Server-side profile discovery and bundle serving now pass; component tests cover empty, loading, failure/retry, focus repair and keyboard tab navigation, but neither replaces a controllable browser run.
- A portable external component now passes source-level registration and owner-generation lifecycle through `@dsh-std/adapter-dsh`, but it does not yet render the two-way/session-isolated fixture required by `SIDEBAR-005` or prove independently packaged loading.
- Migration from the direct sidebar-owned Harness patch remains unrealized. The transition ends when the adapter-managed target passes `SIDEBAR-004`, `SIDEBAR-005`, `SIDEBAR-008` and `SIDEBAR-009` end to end and the direct patch can be removed.
- C3 install and restart succeeded, but target drift maintenance and owned uninstall have not been rerun for this source/adapter pair.
- How the adapter intent package records and machine-checks its Harness target, installed effects and removal ownership without making those implementation details part of this sidebar's semantic authority.
