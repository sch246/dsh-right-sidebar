# @dsh-external/dsh-right-sidebar

DeepSeek Harness Web 的右栏平台底座：提供全高真列、可注册标签页、显隐与宽度管理，以及主界面和右栏共享 session 状态的接入方式。

本包不内置审阅、终端、浏览器、文件、Git、工具详情或其他业务标签。功能插件拥有自己的状态和动作，并可同时向主界面与 `rightbar.tab` 注册 UI，使两处通过同一个 session-scoped store 保持同步。

当前意图、稳定 client API、Agent 驱动的安装维护流程与验收标准见 [.intent/state/STATE.md](.intent/state/STATE.md)，实现设计见 [PROPOSAL.md](PROPOSAL.md)。browser half 使用 Cordis `Context`、renderer-owned `SlotRegistry`、`dsh-client-store` 和 alpha.2 原生 `ctx.layout` 服务；Host frame 提供解析后的显隐状态，插件不镜像布局几何。实现与机械验证记录见 [HANDOFF.md](HANDOFF.md)。

## 目标交互

- 右栏占据应用内容区全高，并作为第三列影响横向布局；
- 应用 navbar 在右栏关闭时提供一个显示按钮，在打开时提供最大化/还原与关闭按钮；
- 新会话界面在发送第一条消息前也可展开和收起右栏；
- 官方分隔条调整普通模式宽度，不设固定最大值；最大化模式占据左栏以外的区域；
- 普通宽度和最大化偏好跨收起、session 切换与刷新保留，右栏可见性仍在启动时重置；
- 第三方插件可注册、排序和卸载标签页；
- 第三方插件可通过稳定的 client service 选择并展开当前 session 的已注册标签页；
- 主界面贡献和右栏标签可共享同一份 session 状态与动作。

## 稳定 client API

`@dsh-external/dsh-right-sidebar/client` 声明两个跨插件入口：session-scoped additive `rightbar.tab` 注册位，以及 `ctx.rightSidebar.openTab(sessionId, tabId)`。调用方插件应注入 `rightSidebar` 服务，并使用当前 session 的 framework identity：

```ts
import type { Context } from '@deepseek-ai/cordis'
import type { RightSidebarSessionId } from '@dsh-external/dsh-right-sidebar/client'

export const inject = ['rightSidebar']

export function openFiles(ctx: Context, sessionId: RightSidebarSessionId): void {
  ctx.rightSidebar.openTab(sessionId, 'files')
}
```

`openTab()` 返回 `void`。当前 details panel 已挂载、`sessionId` 与其绑定一致且 `tabId` 存在于 live `rightbar.tab` ledger 时，它先选择标签，再调用官方 layout service 展开右栏。验证失败抛出 `RightSidebarOpenTabError`；稳定 `code` 为 `not-mounted`、`session-mismatch` 或 `unknown-tab`，且选择和布局均不改变。平台不会向调用方暴露 store、actions 或 raw slot registry。

标签注册卸载会从 live ledger 移除 id；panel 卸载和插件销毁会撤销对应 binding。替换后的旧 binding 与已销毁 runtime 不能继续选择标签。注册示例见 [tests/fixtures/rightbar-consumer.ts](tests/fixtures/rightbar-consumer.ts)。

## 安装与回撤

推荐使用带所有权收据的生命周期脚本：

```bash
DSH_CHECKOUT=/root/deepseek-harness bash scripts/setup.sh
# 回撤同一版本 setup 实际拥有的宿主补丁与 bundle：
DSH_CHECKOUT=/root/deepseek-harness bash scripts/uninstall.sh
```

setup 只接受“补丁尚未应用”或“完全一致地已应用”，核对就近的 `@meta-intent` source-region owner 标记，记录补丁 SHA-256、owner regions 与生成物映射。共享 slot/API catalog 不属于本包补丁；安装与卸载都从当前剩余的全部源贡献重生成，避免与其它插件争用同一生成文件。

## 本地 link 装配

先构建插件：

```bash
cd /root/dsh-right-sidebar
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
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

官方布局前置位于 [patches/deepseek-harness.patch](patches/deepseek-harness.patch)，基于 Harness alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b`。它保留原生三列 frame、拖拽求解器和 `ctx.layout` 服务，增加全局 navbar action seat、blank/new-session details 几何、普通宽度与最大化偏好持久化、无固定最大宽度的普通拖拽、保留左栏的最大化布局、header clearance 和无浮动 grip 的全高分隔条。补丁携带对应的 Host 行为测试；每个逻辑侵入区都带有就近 owner 标记，生成 catalog 由生命周期脚本从当前源贡献重建。

在对应 Harness checkout 中应用：

```bash
git apply --check /root/dsh-right-sidebar/patches/deepseek-harness.patch
git apply /root/dsh-right-sidebar/patches/deepseek-harness.patch
```

升级 Harness 时由 Agent 先重新调查目标，再根据 state 更新或重新生成具体 realization；不得为套用旧补丁而削弱意图。当前补丁仍可由 Agent 手动更新并处理冲突，本仓库不要求额外的标准运行时或固定兼容层。详见 [PROPOSAL.md](PROPOSAL.md#harness-源码改动)。
