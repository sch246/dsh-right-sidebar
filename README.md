# dsh-right-sidebar

DeepSeek Harness Web 的右侧边栏插件：**真列**（接管官方 `details` 列）+ 会话联动层 + **tab 开放接入**。
干净：全程走官方 slot 体系，无 `position:fixed` hack；强大：tab 不内置功能，第三方插件可注册自己的 tab；底座提供面向未来插件的联动服务（`ctx.sessionView`）。**不做文件 / Git / 终端内置功能。**

> 状态：**规划完成，M0 未开工**。本仓库当前只有规划产物；`package.json` / `cordis.patch.yml` 是规划基线，`lib/` 构建出来之前不可安装。

- 完整方案（架构、会话联动层、里程碑、风险、拍板记录）：[PROPOSAL.md](PROPOSAL.md)
- 交接文档：[HANDOFF.md](HANDOFF.md)

## 关键决策（已拍板）

- 挂载方案：接管官方 `details` 列（真列），并在 children 中重新声明 `conversation.details.tool`，保住官方工具详情座位。
- 会话联动：路径 1 —— 自己的会话级 store + 自己的 conversation view/node + `ctx.sessionView` 服务（PROPOSAL.md §3.6）。
- tab 平台化：**不内置文件/Git/终端**；声明公开 `rightbar.tab` 注册槽，第三方插件注册自己的 tab（PROPOSAL.md §3 / M0.7）。
- 发布形态：独立文件夹仓库（骨架参考本机 `/root/dsh-warm-minimal`），本地注入验证稳定后发 GitHub Release pre-release。

## 开发闭环（DSH 注入器）

`dev_scaffold_plugin` → `dev_build_plugin` → `dev_inject_plugin`（web profile）→ `dev_reload_package` 迭代；稳定后 `dev_release_plugin` 发 pre-release。全程不动 DSH 源码，卸载即净。
