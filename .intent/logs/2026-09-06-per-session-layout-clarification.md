# Per-session sidebar layout clarification

Date: 2026-09-06

## User meaning and supersession

In task “评估网页文件查看编辑能力”, the user said at 2026-09-05 03:37:34 UTC, “而且在切换出去再切换回来时这全屏状态应该是保留的”, and at 04:26:05 UTC, “而且现在切换session不会保留侧边栏打开的状态，即使保留全屏状态也没用啊”. These statements require retaining state when returning; they do not explicitly request one shared state for all sessions.

In task “阅读并优化相关内容”, the user clarified that each session must retain its own open and fullscreen state, and a session whose sidebar was closed must remain closed when selected. The user then explicitly chose “刷新后也恢复各会话状态（推荐）” and “宽度也按会话保存（推荐）”. Reload persistence and per-session ordinary width are confirmed by these new answers, not inferred from the earlier wording.

This supersedes the global/transient interpretation in the prior STATE and the current-meaning claims derived from the [maximization record](2026-09-05-sidebar-maximization-and-host-ownership.md). That historical record remains evidence of the earlier implementation and checks; its successful tests do not establish the corrected meaning.

## Checked discrepancy and required effect

The inspected Host layout store had one `detailsOpen` value and persisted global `detailsWidth` and `detailsMaximized` under `dsh.layout.panels.v1`. AppFrame changed session content without selecting different layout preferences. An existing test expected a newly selected blank session to inherit maximization. The documentation maintenance pass retained that interpretation without distinguishing it from the user’s meaning.

The corrected acceptance uses A → B → A and reload: A can be open, maximized and retain one ordinary width; untouched B starts closed and can later retain a different width and maximization. Returning or reloading restores the selected session’s own values. Closing affects only that session and retains its width and maximization for reopening. The Host owns these preferences; workbench instance and group state remains owned by the sidebar runtime.

Old global preferences have no reliable session attribution and must not initialize every session. The replacement storage leaves those historical bytes untouched. This correction does not authorize deleting feature drafts or tab layouts, changing profile membership, or restarting the managed service. Candidate verification and activation are separate observations; earlier activation evidence does not cover this correction.

## Candidate implementation

Source `fde7ed0c9b2d981348da2bc8d9c029d1142fa9b0` carries the complete corrected Host patch against official alpha.2 `0a53fb55bea101816fa226bb964ae2bed71c343b`. It persists one `detailsBySession` map under `dsh.layout.panels.v2`, derives the selected entry, resolves service actions against current selection, and prevents a delayed drag from writing into a newly selected session. Ordinary blank sessions already have an ID before their first message; only the no-workspace landing has no writable session entry. The candidate bundle and focused TypeScript check passed. The complete Host build encountered unavailable generated Remote declarations in the isolated checkout; it is not reported as passing. No managed Host source, receipt, profile, live artifact or service was changed for this correction.

The user then explicitly requested fewer tests and faster implementation, noting that direct manual interaction is often faster, clearer and cheaper. Further test expansion and Agent browser testing stopped. The manual acceptance remains the A → B → A and reload scenario in STATE; no human acceptance is claimed.
