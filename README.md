# dsh-right-sidebar workspace

## Workspace operations

The root is a development workspace; installable packages live under `packages/`. Run these root entries with prepared repository-local dependencies. `DSH_CHECKOUT` selects compatible Host source/declarations; profile operations also require explicit `DSH_HOME` and `DSH_PROFILE`.

| Root entry | Direct command from this repository | Effect |
| --- | --- | --- |
| `build` | `bash scripts/build.sh` | Build owned package artifacts. |
| `typecheck` | `bash scripts/typecheck.sh` | Check owned Host and Client programs. |
| `setup` | `bash scripts/setup.sh` | Inspect by default; append `--install` for installation. |
| `inspect` | `bash scripts/setup.sh --check` | Inspect only. |
| `remove` | `bash scripts/uninstall.sh` | Inspect by default; append `--remove` for removal. |

Build, typecheck and existing tests call installed Node tools directly; they never install dependencies. Tool versions are TypeScript 5.9.3, tsdown 0.22.14 and Vitest 4.1.8, with pnpm 10.17.1 declared for explicit dependency preparation. Use independent dependency directories when reusing existing package contents. Installation and removal retain the existing `dsh plugin` transactions and never restart services. The `uninstall` alias, where present, has the same inspection default as `remove`.

Each repository and package keeps its own version: compatibility means satisfying declared API ranges, not equal version numbers. Optional cooperation does not make another feature a required dependency. Root and distributed package licenses are MIT, with their copyright notices retained.

本仓库保留独立 Git 与 `.intent/` 意图包，根目录负责 pnpm workspace 和操作脚本。唯一插件包是 [@dsh-external/dsh-right-sidebar](packages/dsh-right-sidebar/README.md)，源码、测试、manifest、Bundle layer、Host patch 与 `lib/` 均归 `packages/dsh-right-sidebar/` 所有。

从根目录构建和验证，使用 `DSH_CHECKOUT` 指定已准备好工具链和 Client 声明的 Harness checkout：

```bash
DSH_CHECKOUT=/root/deepseek-harness pnpm build
DSH_CHECKOUT=/root/deepseek-harness pnpm typecheck
pnpm build:client
```

构建、类型检查和测试使用本仓库安装的 TypeScript 5.9.3、tsdown 0.22.14、Vitest 4.1.8。先运行 `pnpm install --ignore-scripts`；`DSH_CHECKOUT` 只选择目标 Host 源码和声明，构建仅刷新必要的 Host package links，不覆盖本地编译器、测试库或 React。安装和移除默认检查，显式 `--install` / `--remove` 才执行；统一要求 `DSH_CHECKOUT`、`DSH_HOME`、`DSH_PROFILE`。操作范围见 [安装地图](.intent/state/STATE.md#installation-maintenance-and-removal)。

根目录不是可安装的 DSH 插件。已经准备好的实现注册目标为：

```bash
dsh plugin --profile web add /absolute/plugin-checkout/packages/dsh-right-sidebar
```

安装消费者使用子包路径；通过 `dsh plugin add` 事务更新 profile 依赖、解析路径和 Bundle。公开 `/client` 导出、renderer id 和浏览器存储身份独立于仓库位置。文件接收与遮罩由独立的 dsh-file-drop 插件及其消费者提供；sidebar 只拥有布局与内部 docking，不要求该插件。

浏览器布局键包含固定包名字符串 `@dsh-external/dsh-right-sidebar/workbench/1`，恢复备份键追加 `-invalid-backup`，不会从 checkout 或包目录派生。session 子键来自 sessionId，实例的 viewId 与 restore descriptor 保持原值；Host 的固定键 `dsh.layout.panels.v2` 也不变。同一浏览器 origin 下，纯包路径移动无需迁移或清除布局与草稿。源码身份和证据范围见 [迁移记录](.intent/logs/2026-09-06-workspace-package-layout.md)；live profile 和服务需要独立迁移及验收。
