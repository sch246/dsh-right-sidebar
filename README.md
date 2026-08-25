# @dsh-external/dsh-right-sidebar

DeepSeek Harness Web 的右栏平台底座：提供全高真列、可注册标签页、显隐与宽度管理，以及主界面和右栏共享 session 状态的接入方式。

本包不内置审阅、终端、浏览器、文件、Git、工具详情或其他业务标签。功能插件拥有自己的状态和动作，并可同时向主界面与 `rightbar.tab` 注册 UI，使两处通过同一个 session-scoped store 保持同步。

当前意图、约束与验收标准见 [.intent/state/STATE.md](.intent/state/STATE.md)，实现设计见 [PROPOSAL.md](PROPOSAL.md)。当前实现已经通过构建、组件测试、profile `link:` 安装和真实浏览器交互验证；验证记录见 [HANDOFF.md](HANDOFF.md)。

## 目标交互

- 右栏占据应用内容区全高，并作为第三列影响横向布局；
- 应用 navbar 提供显示/隐藏按钮，右栏内部提供收起按钮；
- 官方分隔条调整宽度，只记忆最后一次非零宽度；
- 第三方插件可注册、排序和卸载标签页；
- 主界面贡献和右栏标签可共享同一份 session 状态与动作。

## 本地 link 装配

先构建插件：

```bash
cd /root/dsh-right-sidebar
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
npm test
```

然后使用与 `dsh-warm-minimal` 相同的 profile link 模型：

```bash
dsh plugin --profile web add /root/dsh-right-sidebar
dsh --profile web --dump-config
```

profile 记录 `link:/root/dsh-right-sidebar`。修改或拉取插件后重新构建并执行 `systemctl restart dsh-web` 即可加载更新，不需要复制源码。卸载命令：

```bash
dsh plugin --profile web remove @dsh-external/dsh-right-sidebar
```

开发期可通过 super-injector 执行 build、inject、reload 和 uninject；该流程只用于迭代，不替代 profile bundle 安装。

## Harness 源码补丁

官方布局前置位于 [patches/deepseek-harness.patch](patches/deepseek-harness.patch)，基于官方 Harness commit `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`。它增加全局 navbar action slot，并让 layout store 只持久化右栏宽度、不持久化开合状态。

在对应 Harness checkout 中应用：

```bash
git apply --check /root/dsh-right-sidebar/patches/deepseek-harness.patch
git apply /root/dsh-right-sidebar/patches/deepseek-harness.patch
```

升级 Harness 时由 agent 根据新的官方代码手动更新补丁并处理冲突；本仓库不增加自动 apply/revert 或兼容层。详见 [PROPOSAL.md](PROPOSAL.md#harness-源码改动)。
