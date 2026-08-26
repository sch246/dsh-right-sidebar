# New-conversation visibility deployment

Record ID: `SRC-2026-08-26-RIGHT-SIDEBAR-NEW-CONVERSATION-DEPLOYMENT`

Status: Authorized installation/restart evidence. User-visible interaction acceptance remains pending.

## Authority

The user authorized the external action:

> 安装并重启，我手动测

## Actions and observations

- The current Harness worktree passed reverse patch checking, confirming that the plugin-owned Harness contribution, including the new-conversation visibility repair, was present.
- The `web` profile dump already contained `@dsh-external/dsh-right-sidebar`; the package was not redundantly added again.
- The right-sidebar build and tests had already regenerated its browser bundle and declarations.
- `@deepseek-ai/dsh-client-ui-layout` was rebuilt after the target source change.
- `systemctl restart dsh-web` completed. The service became active with a new main process and activation timestamp `2026-08-26 09:44:07 CST`.
- The local application at `http://127.0.0.1:3082/` and the public application at `https://dsh.sch246.top/` both returned HTTP 200 with the same document size after startup.

## Boundary

These observations prove profile presence, built artifacts, service restart and HTTP delivery. They do not prove that a browser loaded the new client bundle without cache, that the new-conversation toggle now changes rendered geometry, or that adjacent interaction remains acceptable. The user will perform that manual check.
