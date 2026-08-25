# Visual chrome deployment evidence

Record ID: `SRC-2026-08-26-VISUAL-CHROME-DEPLOYMENT`

Status: checked implementation and live assembly evidence for the visual revision. It does not constitute human visual acceptance.

## Frozen source

Commit `794ecd03fc9b80619b679b5d33f844f55b786eb9` implements the visual revision recorded by `SRC-2026-08-26-VISUAL-CHROME-REVISION`.

The plugin panel no longer renders a visible title, internal collapse action, empty-state notice or empty tab strip. Tab navigation, loading, failure containment and retry remain available when a contribution exists.

The Harness patch is rebased to target commit `b642a10626a950cc95c2d6f839810cb01fe599fe`. It retains an invisible full-height resize hit strip, removes the decorative details pill, measures the global navbar, and exposes enough inherited clearance for the conversation header while details are closed.

## Reproduction and checks

- The pre-fix panel regression failed because `No sidebar tabs registered` was still rendered; it passed after the change.
- The pre-fix layout regression failed because `--dsh-shell-navbar-clearance` was absent; it passed after the change.
- The complete sidebar suite passed: 2 files, 10 tests.
- The complete `ui-layout` suite passed: 6 files, 60 tests.
- Harness client TypeScript project references passed with `pnpm run typecheck:contracts-ready`.
- The generated Harness patch applied cleanly to a fresh archive of its declared target commit.

## Live assembly

The linked plugin and affected Harness client packages were rebuilt, then `dsh-web` was restarted under the previously granted service authority. The service returned to `active` and the public root returned HTTP 200.

The public boot manifest selected:

- `@dsh-external/dsh-right-sidebar` revision `c28f910c11d3`;
- `@deepseek-ai/dsh-client-ui-layout` revision `8e0401f9441d`;
- `@deepseek-ai/dsh-client-ui-conversation` revision `11697f17fe6c`.

The served layout bundle contains the navbar-clearance producer, the conversation bundle contains its consumer, and the sidebar bundle contains none of `dsh-rightbar-collapse`, `No sidebar tabs registered`, or `尚未注册侧栏标签页`.

## Evidence boundary

This establishes source behavior, regression coverage, patch applicability, production assembly and public delivery. No controllable browser runtime was available, so it does not prove rendered pixel separation, pointer hit behavior, persisted width, or subjective visual quality. The user's live inspection remains the authority for those effects.
