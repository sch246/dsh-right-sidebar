# Tab gesture regions

The user clarified right-sidebar interaction semantics during the resource-workbench follow-up. This is an authorized intent clarification, advancing state from `0.4.0-draft.4` to `0.4.0-draft.5`; it does not authorize installation or activation.

The tab bar includes labels, icons, its scrollable track, empty space and fixed group actions. It only selects tab insertion order, within or across groups. A dark insertion line identifies the exact slot: horizontal in a vertical rail and vertical in a horizontal bar. No content docking overlay covers a tab bar. Vertical labels, icons, launcher and orientation controls align to the left.

Only the content rectangle participates in docking classification. Its outer ten percent on each edge selects a half-area split and its center joins the group. A vertical rail therefore does not consume the content's left-edge docking region. Content hover previews stay inside that content rectangle without mutating layout.

Horizontal tab lists translate ordinary and Shift-modified wheel movement into horizontal scrolling and preserve trackpad deltaX input. Ctrl-modified zoom remains available. The list cancels wheel propagation and default behavior only when its scroll position actually changes.

Inspection found that workspace capture excluded only `.dsh-rightbar-tabscroll`, leaving fixed tab actions in content classification; geometry used the complete leaf including its rail; tab hover reused the content overlay; and there was no horizontal wheel listener. Vertical labels already had `text-align:left`; the fixed-action container used centered cross-axis alignment. Internal custom-MIME drag isolation, external editor drops, runtime insertion-index adjustment, empty-group collapse and keyboard alternatives remain required.

Candidate `right-sidebar-linux-web-0.4.0-candidate.1` freezes the preceding state and remains immutable historical deployment evidence. It is removed from current candidate selection. No accepted lock is created for this isolated implementation slice; the coordinating Agent owns real-browser integration evidence.

## Isolated implementation evidence

Eight added regression cases failed against the original panel through bubbling DOM events: horizontal and vertical insertion hover produced content overlays, both fixed actions selected a right split, the vertical rail displaced the content left-edge target, and ordinary, Shift-modified and deltaX wheel events left scrollLeft at zero. After the repair, all 44 plugin tests passed with the candidate Harness toolchain. Additional cases cover four content edges and center, preview dimensions, an empty destination tab bar, left-aligned action styles, wheel propagation at overflow limits, line/page input, and listener cleanup on orientation change and unmount. Existing runtime tests retain same-group index adjustment, empty-source collapse, and preview pinning coverage.

Executed successful commands from the isolated plugin checkout: `DSH_CHECKOUT=/root/dsh-resource-workbench-candidate/harness node node_modules/vitest/vitest.mjs run`; `/root/dsh-resource-workbench-candidate/harness/node_modules/.bin/tsc -p tsconfig.json --noEmit`; `/root/dsh-resource-workbench-candidate/harness/node_modules/.bin/tsc -p tsconfig.client.json --noEmit`; `DSH_CHECKOUT=/root/dsh-resource-workbench-candidate/harness bash scripts/build.sh`; `node /root/meta-intent/locks/protocol-0.2/bin/validate.mjs .`; and `git diff --check`.

The initial `pnpm test -- tests/right-sidebar.client.spec.tsx -t 'insertion slots|insertion space|content left edge|wheel input'` observed all eight regression failures but also auto-installed registry dependencies. Those substitutions caused a subsequent Client typecheck to miss the candidate Host declarations. The owned build restored candidate dependency links; direct Vitest invocation and both typechecks then passed. The generated untracked pnpm lockfile was removed. No profile, Host source, service or adjacent plugin was changed. Browser integration remains outside this slice's test evidence.
