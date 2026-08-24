# Handoff — dsh-right-sidebar 右侧边栏插件（M0 待开工）

生成日期：2026-08-24（本会话）
目标：为 DeepSeek Harness Web 开发干净、强大的右侧边栏插件，走「真列」架构，最终发 GitHub Release pre-release。

## 背景（本会话干了什么）

1. 用户要找「给 DSH 加右侧边栏」的现成插件；GitHub `dsh-plugin` topic 检索到 webkong/dsh-plugin-sidebar、DDDFXYqiming/dsh-side-panel-patched（fork 增强版）、xiaoksio/dsh-solution-explorer、pang123hui/dsh-workspace-sidebar、AKS1st/dock 等，均为 bundle 形态。
2. 结论：现有插件「不够干净」——多数是 `position:fixed` 浮层盖在官方 details 列上，遮挡官方「工具调用详情」面板。
3. 决定自研本仓库。方案唯一权威文档：[PROPOSAL.md](PROPOSAL.md)（架构、联动层、里程碑、风险、拍板记录，不在此重复）。
4. 已拍板：A = `details` 接管（真列）；D = 联动路径 1（自己的会话级 store + 自己的 conversation view/node + `ctx.sessionView` 服务）；E = tab 平台化（**不内置文件/Git/终端**，声明公开 `rightbar.tab` 注册槽，第三方插件注册自己的 tab）。仓库名 `dsh-right-sidebar`、MVP 验收标准按推荐默认值。
5. 仓库已初始化并提交；**M0 未开工**。

## 环境与工具

- DSH checkout：`/root/deepseek-harness`（vendored Cordis；`packages/client/*` 是浏览器端）。
- 运行中的 web profile：`/root/.dsh/profiles/web`；dsh-super-injector 已装载，dev_* 工具可用：`dev_scaffold_plugin` / `dev_build_plugin` / `dev_inject_plugin` / `dev_reload_package` / `dev_uninject_plugin` / `dev_release_plugin` / `dev_plugin_status`。
- 开发闭环（不动 DSH 源码）：`dev_scaffold_plugin`（ui-panel 形态）→ 按 PROPOSAL.md §3/§3.6 改实现 → `dev_build_plugin` → `dev_inject_plugin`（web）→ `dev_reload_package` 迭代。
- 仓库骨架参考：`/root/dsh-warm-minimal`（package.json + `dsh.bundle.patch` → cordis.patch.yml 的布局）。
- 验收界面：http://127.0.0.1:3082（本会话的 Web GUI）。

## 关键技术锚点（已核实；细节在 PROPOSAL.md §3.5/§3.6）

- 右侧真列 = 官方 `details` slot（single，scope: session）；AppFrame 自带拖拽把手，宽度契约 300–520px（`packages/client/ui-layout/src/client/columns.ts` 的 DETAILS_* 常量）；开关走 `ctx.layout.openDetails()/closeDetails()`。
- 动态注册 single slot 会 shadow 官方条目（`packages/client/runtime/src/client/slots.ts` 顶部注释）；接管 `details` 后必须重新声明并渲染 `conversation.details.tool` 座位（`ui-conversation/src/client/apply.ts` L447 起是官方注册样例）。
- 跨包红线：官方选中态在 ui-conversation 私有 chatStore，不可读；官方 ChatView 无滚动/折叠跨包 API → 联动以我们自己的 conversation view（`conversation.view` 是 list slot，scope session，`ui-conversation/src/client/contract/slots.ts` L113）+ conversation node 为锚。
- 跨包动作服务：`ctx.conversation`（send/cancel/loadOlder/updateQueue）、`ctx.conversation.input`（insertReference/setDraft/submit/notify）、`workspaces.openPath`。
- 客户端编码规范：`packages/client/AGENTS.md`（四 shares、`slots.register`、store 工厂、CSS Modules + `--dsw-*` tokens、中文文案）；Conversation Node 参考 `docs/cookbook/adding-a-conversation-node.md`。

## 下一步（M0，建议顺序）

1. R1 spike（先验证再正式开工）：临时接管 `details` 的最小注册，确认 shadow 语义、热重载/HMR 稳定性、`conversation.details.tool` 重声明可用。
2. `dev_scaffold_plugin`（ui-panel）→ 实现 M0：详情 tab（收编官方工具详情座位）+ 开关按钮（挂 `sidebar.footer.action`）+ 拖拽（复用官方把手）+ 宽度持久化（entry store / localStorage）。
3. `dev_build_plugin` → `dev_inject_plugin`（web）→ 请用户在 GUI 确认验收：右侧栏可见、可开关/拖拽、刷新后宽度记住、官方工具详情仍在。
4. M0.5 联动层（PROPOSAL.md §3.6）：会话级 store（revealTarget / folded / activeView / selectedCall）+ `ctx.sessionView` 服务 + 自己的 conversation view/node 最小闭环（两侧点选同步）。
5. M0.7 tab 开放接入：声明 `rightbar.tab` 注册槽（机制对齐官方 `conversation.view` 的 id/order/label）+ 一个示例 tab，验证注册/激活/HMR/卸载；不内置文件/Git/终端。

## 待办提醒

- GitHub remote 未创建；发 pre-release 前需 `git remote` + gh 登录（`dev_release_plugin` 依赖）。
- `package.json` / `cordis.patch.yml` 是规划基线，`lib/` 未构建，当前不可安装。
- 若未来要驱动官方 ChatView 本体（滚动/折叠），需评估给 ui-conversation 加最小扩展点（动官方代码，方案默认排除，见 PROPOSAL.md R4）。

## 建议技能（下一会话）

- 实现本身无需特殊技能；UI 交互形态拿不准时用 `prototype` 做切换式原型。
- 注入/构建/HMR 出问题时用 `diagnose`。
