# dsh-right-sidebar workspace

本仓库保留独立 Git 与 `.intent/` 意图包，根目录负责 pnpm workspace 和操作脚本。唯一插件包是 [@dsh-external/dsh-right-sidebar](packages/dsh-right-sidebar/README.md)，源码、测试、manifest、Bundle layer、Host patch 与 `lib/` 均归 `packages/dsh-right-sidebar/` 所有。

从根目录构建和验证，使用 `DSH_CHECKOUT` 指定已准备好工具链和 Client 声明的 Harness checkout：

```bash
DSH_CHECKOUT=/root/deepseek-harness pnpm build
DSH_CHECKOUT=/root/deepseek-harness pnpm test
pnpm typecheck
pnpm build:client
```

构建使用目标 Harness 的既有 tsc、tsdown 和依赖，在本仓库根目录刷新 dependency links，并只重建子包 `lib/`。根 devDependencies 保留原有版本范围；本次目录调整不升级工具链。安装和移除仍通过根 `pnpm run setup` / `pnpm run uninstall` 或 `scripts/setup.sh` / `scripts/uninstall.sh`，其 Host 写入与权限要求见 [操作地图](.intent/state/STATE.md#installation-maintenance-and-removal)。

根目录不是可安装的 DSH 插件。已经准备好的实现注册目标为：

```bash
dsh plugin --profile web add /absolute/plugin-checkout/packages/dsh-right-sidebar
```

所有旧根路径消费者需改为子包路径：profile 的 `link:` / `file:` 依赖通过 `dsh plugin add` 事务更新；相邻 file-viewer、file-manager 和 resource-links 仓库的 sidebar 依赖、构建链接和测试 alias 需各自在其所有权内跟进；直接读取旧根 `src/`、`lib/`、`cordis.patch.yml` 或 `patches/` 的调用方需在路径中加入 `packages/dsh-right-sidebar/`。包名、版本 `0.0.1`、公开 `/client` 导出与 renderer id 保持不变；根目录不提供转发 exports 或旧路径副本。

浏览器布局键包含固定包名字符串 `@dsh-external/dsh-right-sidebar/workbench/1`，恢复备份键追加 `-invalid-backup`，不会从 checkout 或包目录派生。session 子键来自 sessionId，实例的 viewId 与 restore descriptor 保持原值；Host 的固定键 `dsh.layout.panels.v2` 也不变。同一浏览器 origin 下，纯包路径移动无需迁移或清除布局与草稿。源码身份和证据范围见 [迁移记录](.intent/logs/2026-09-06-workspace-package-layout.md)；live profile 和服务需要独立迁移及验收。
