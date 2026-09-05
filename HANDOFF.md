# dsh-right-sidebar 源码交接

[.intent/state/STATE.md](.intent/state/STATE.md) 是当前语义权威；[PROPOSAL.md](PROPOSAL.md) 记录实现设计。本文只描述本 checkout 的源码职责和本地验证，不声明 profile 安装、live browser 验收或 realization activation。

## 当前源码职责

- Node half 为 no-op；browser half 接管 Host `details` 列，声明 session-scoped `rightbar.view` list slot，并注册 `shell.navbar.action` controls。
- `ctx.rightSidebar` 对外提供 `registerLauncher` / `launch` / `openInstance` / `activateInstance` / `updateInstance` / `closeInstance`。它不暴露 Host layout state、slot registry 或 runtime snapshot writer。
- `RightSidebarRuntime` 是每个 session 的实例顺序和 active instance 的唯一权威。工作台不依赖 `dsh-client-store`，不存在独立 active-tab handle 或并行注册路径。
- view registration 离开 live ledger 时，runtime 清理所有 session 中依赖该 renderer 的实例并修复 active selection。
- close veto、callback rejection、并发 close、update-during-close、view-remove/reopen 同 id 都由一个 object-identity commit check 保护。
- panel 显示 launcher home、可滚动 instance tabs、固定 `+`、Host control clearance、keyboard navigation、loading/failure state 和 launcher/close operation error。生产包不注册默认 Files 或其他业务功能。
- navbar controls 只通过 Host `ctx.layout` 操作显隐与最大化；插件不镜像几何或偏好。

## Host patch 边界

[patches/deepseek-harness.patch](patches/deepseek-harness.patch) 归 Host realization 所有，基线为 `0a53fb55bea101816fa226bb964ae2bed71c343b`。它提供 navbar action seat、blank-session details 几何、宽度/最大化偏好、最大化布局和全高 divider。插件 runtime 不接管这些 Host 职责。

setup、uninstall、profile 修改、service restart、live deployment 和 realization lock sealing 需要各自的目标调查与权限，不由源码构建结果推断。

## 本地验证

完成交接前运行并记录的命令：

```bash
DSH_CHECKOUT=/root/deepseek-harness node node_modules/vitest/vitest.mjs run
/root/deepseek-harness/node_modules/.bin/tsc -p tsconfig.client.json --noEmit
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
git diff --cached --check
```

这些命令分别覆盖 plugin lifecycle、公开 consumer 注册、多 session runtime、view cleanup、close races、panel interaction、Client 类型、Node entry、browser declarations 与 bundle。具体结果以交接 commit 的实际命令输出为准。
