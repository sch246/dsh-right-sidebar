# @dsh-external/dsh-right-sidebar

DeepSeek Harness Web 的右栏工作台底座：复用 Host 的全高 `details` 真列，并提供功能启动器、session 内多实例标签和静态视图注册位。

本包不注册 Files、审阅、终端、浏览器、Git、工具详情或其他业务功能。功能插件拥有启动器、视图 renderer、实例标题、关闭决策及编辑器或选择器状态；右栏 runtime 只拥有每个 session 的有序实例 ledger 和 active instance。布局宽度、显隐与最大化仍由 Host `ctx.layout` 持有。

当前意图、稳定 client API 和 Agent 驱动的维护规则见 [.intent/state/STATE.md](.intent/state/STATE.md)，目标相关布局改动见 [patches/deepseek-harness.patch](patches/deepseek-harness.patch)。没有 active 或 accepted realization；源码构建和测试不代表 profile 安装、live browser 验收或 realization activation。

## 工作台行为

- 没有 active instance 时显示 launcher home；`+` 只选择 launcher home，不关闭已打开实例。
- `rightbar.view` 是 session-scoped list slot。renderer 是静态注册，活动实例通过 owner props 接收 `{ instanceId }`。
- `openInstance()` 按 session 内 `id` 去重。新 id 追加到 ledger；已有 id 保留原 renderer、标题和关闭回调，仅被激活。
- 实例在 session 切换后保留。关闭 active instance 时优先激活其后一个实例，否则激活前一个；没有剩余实例时回到 launcher home。
- `rightbar.view` 注册离开 live ledger 时，runtime 立即移除引用该 renderer 的所有 session 实例。该生命周期清理不调用 `onClose`，因为 feature renderer 已不可用。
- tab label 在独立滚动区溢出；`+` 与 Host navbar controls 保持固定可达。右侧通过 `--dsh-shell-navbar-width` 预留 Host 控件宽度，fallback 为 80px。
- launcher 或关闭操作 rejection 显示 locale-owned panel error；view loading 和 render failure 保留在工作台内容区。

## 稳定 client API

`@dsh-external/dsh-right-sidebar/client` 合并 `ctx.rightSidebar`，并声明 `rightbar.view`：

```ts
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {
  RightbarViewOwnerProps,
  RightSidebarSessionId,
} from '@dsh-external/dsh-right-sidebar/client'

export const inject = ['slots', 'rightSidebar']

function Editor({ instanceId }: RightbarViewOwnerProps) {
  return instanceId
}

export function apply(ctx: Context): void {
  ctx.slots.inject('rightbar.view', () => [
    ctx.slots.register({ name: 'rightbar.view', id: 'editor' }, Editor),
    ctx.rightSidebar.registerLauncher({
      id: 'editor',
      label: 'Editor',
      open(sessionId: RightSidebarSessionId, selection?: unknown) {
        const documentId = typeof selection === 'string' ? selection : 'untitled'
        ctx.rightSidebar.openInstance(sessionId, {
          id: `editor:${documentId}`,
          viewId: 'editor',
          title: documentId,
        })
      },
    }),
  ])
}
```

Public service methods are:

- `registerLauncher({ id, label, open })` returns an idempotent disposer. Duplicate live ids throw `RightSidebarError` with `code: 'duplicate-launcher'`.
- `launch(sessionId, launcherId, selection?)` requires the mounted session, invokes the live launcher and preserves its rejection.
- `openInstance(sessionId, { id, viewId, title, onClose? })` validates the mounted session and live view before state or layout side effects, activates the instance, then calls Host `openDetails()`.
- `activateInstance(sessionId, id)` selects an existing instance for the mounted session.
- `updateInstance(sessionId, id, { title? })` changes presentation without reordering or selecting the instance.
- `closeInstance(sessionId, id)` coalesces concurrent closes of the same instance. `onClose()` returning `false` vetoes removal; rejection leaves the instance open and reaches the caller. A completion cannot remove an updated, lifecycle-removed or reopened instance with the same id.

Other stable error codes are `not-mounted`, `session-mismatch`, `unknown-launcher`, `unknown-view`, `unknown-instance` and `disposed`. Validation failures occur before workbench or layout writes. The service never exposes Host layout state, a raw slot registry or a second store.

## 构建

在插件 checkout 中使用目标 Harness 的工具链和 Client packages：

```bash
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
```

该命令构建 Node no-op entry、browser declarations 和 browser bundle。它只重建本 checkout 的 `lib/` 并刷新本地 `node_modules` dependency links，不安装 profile、不应用 Host patch，也不重启服务。

## 安装与回撤

生命周期脚本会检查目标基线、Host patch 所有权和 setup receipt；运行前必须按当前 state 重新调查目标并获得外部写权限：

```bash
DSH_CHECKOUT=/root/deepseek-harness bash scripts/setup.sh
DSH_CHECKOUT=/root/deepseek-harness bash scripts/uninstall.sh
```

本地开发也可在构建后使用 profile link：

```bash
dsh plugin --profile web add /root/dsh-right-sidebar
dsh --profile web --dump-config
dsh plugin --profile web remove @dsh-external/dsh-right-sidebar
```

profile 记录 `link:` dependency。更新 checkout 后需重新构建并在获得相应权限后重启 `dsh-web`。

## Host 源码补丁

[patches/deepseek-harness.patch](patches/deepseek-harness.patch) 绑定 Harness alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b`。它增加全局 navbar action seat、blank/new-session details 几何、普通宽度与最大化偏好、保留左栏的最大化布局、header clearance 和全高分隔条。

升级 Harness 时，Agent 必须从 state 与新目标重新合成 realization。补丁可应用不等于目标仍满足当前意图；不得用 compatibility path 或静默降级维持旧 patch。
