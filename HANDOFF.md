# dsh-right-sidebar 源码交接

[.intent/state/STATE.md](.intent/state/STATE.md) 是当前语义权威；[PROPOSAL.md](PROPOSAL.md) 记录实现设计。本文只描述本 checkout 的源码职责和本地验证，不声明 profile 安装、live browser 验收或 realization activation。

## 当前源码职责

- Node half 为 no-op；browser half 接管 Host `details` 列，声明 session-scoped `rightbar.view` list slot，并注册 `shell.navbar.action` controls。
- `ctx.rightSidebar` 对外提供 launcher、restorer、group target、preview/pin、same-id renderer switch、activate/update/close 操作。它不暴露 Host layout state、slot registry 或 runtime snapshot writer。
- `RightSidebarRuntime` 是每个 session 布局树的唯一权威。split 拥有比例，leaf group 拥有标签、active instance、方向和 vertical rail width；没有平行 ledger 或 active-tab mirror。
- versioned browser storage 只投影该树和 opaque restore descriptor。缺失 renderer/restorer 与恢复失败保留 placeholder，损坏输入保留 recovery copy。
- restorer 的同步 `onRestored` 只在 exact identity 提交 ready 并安装 close callbacks 后通知，feature 可据此 flush 恢复期间发现的 descriptor，无需 timer。
- preview replacement 和 close decision 使用 instance identity 与 open generation 防止旧完成删除或激活新内容。`onClose` 只决定，`onClosed` 仅在权威删除提交后清理 feature state。
- `updateInstance` 可原位 checkpoint JSON-safe restore descriptor，不借用 renderer switch 或改变 close lifecycle。
- panel 提供 10% 四边 docking、center ordering、half-area hover、横纵 tab、split/rail resize、reset/recovery 和非拖动操作入口。右上 leaf 根据几何为 Host controls 留出 clearance。
- active renderer 使用跨组稳定 key；移动或重排不重建它。未激活的恢复标签不会一次性加载 renderer。
- navbar controls 只通过 Host `ctx.layout` 操作显隐与最大化；插件不镜像几何或偏好。

## Host patch 边界

[patches/deepseek-harness.patch](patches/deepseek-harness.patch) 归 Host realization 所有，基线为 `0a53fb55bea101816fa226bb964ae2bed71c343b`。它提供 navbar action seat、blank-session details 几何、宽度/最大化偏好、最大化布局和全高 divider。插件 runtime 不接管这些 Host 职责。

setup、uninstall、profile 修改、service restart、live deployment 和 realization lock sealing 需要各自的目标调查与权限，不由源码构建结果推断。

## 本地验证

完成交接前运行并记录的命令：

```bash
DSH_CHECKOUT=/root/deepseek-harness node node_modules/vitest/vitest.mjs run
/root/deepseek-harness/node_modules/.bin/tsc -p tsconfig.client.json --noEmit
/root/deepseek-harness/node_modules/.bin/tsc -p tsconfig.json --noEmit
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
node /root/meta-intent/locks/protocol-0.2/bin/validate.mjs .
git diff --cached --check
```

这些命令分别覆盖 plugin lifecycle、公开 consumer 注册、group routing、preview/close races、browser restoration、docking、panel interaction、Client 类型、Node entry、browser declarations 与 bundle。具体结果以交接 commit 的实际命令输出为准。
