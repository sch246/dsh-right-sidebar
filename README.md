# @dsh-external/dsh-right-sidebar

DeepSeek Harness Web 的右栏工作台底座。它复用 Host 的全高 `details` 真列，为每个 session 保存可分栏的标签组、预览生命周期、横向或纵向标签、尺寸偏好和浏览器恢复信息。

本包不注册 Files、审阅、终端、浏览器、Git、工具详情或其他业务功能。功能插件拥有启动器、renderer、恢复描述符、关闭决策以及编辑器或选择器状态；右栏 runtime 只拥有布局树和实例归属。布局宽度、显隐与最大化仍由 Host `ctx.layout` 持有。

当前意图和稳定 client API 见 [.intent/state/STATE.md](.intent/state/STATE.md)，目标相关布局改动见 [patches/deepseek-harness.patch](patches/deepseek-harness.patch)。没有 active、accepted 或 selected candidate realization；源码构建和测试不代表 profile 安装、live browser 验收或 realization activation。

## 工作台行为

- 每个 session 只有一棵布局树。split 保存横向或纵向比例；leaf group 保存标签顺序、活动实例、标签方向和纵向栏宽。
- 每组最多一个斜体 preview。打开下一个 preview 会先等待旧 preview 的关闭决策；veto 取消新打开。双击标签或功能首次编辑时调用 `pinInstance()` 固定 preview。
- 相对打开由 runtime 集中解析。现有目标按几何距离选择，tree preorder 打破平局；没有目标时才在来源组旁创建 50/50 split。
- 拖动到组四边 10% 区域时预览实际半区，drop 才创建 split；中心 drop 加入目标组，标签 drop 指定顺序。显式移动会固定 preview，空的非 root 组折叠。
- 顶部横向标签与 Host controls 同行，右上组通过 `--dsh-shell-navbar-width` 预留空间。纵向右上组为 tab rail 和内容保留本地 clearance；可滚动标签和 action menu 不覆盖 Host controls。
- split 和纵向 rail 支持 pointer、方向键与 reset。比例和 rail 宽没有固定最大值；rail 收窄后保留恢复按钮。
- 移动中的 active renderer 以稳定 `instanceId` key 留在同一 React surface；单纯移动或重排不重建 feature component。未激活的 renderer 不因恢复布局一次性加载。
- 浏览器存储只保存 versioned JSON 布局、实例元数据和 opaque restore descriptor。缺失 renderer/restorer 保留 placeholder；恢复失败可重试，不删除标签。损坏快照被拒绝，并保留原始 JSON recovery copy。

## 稳定 client API

`@dsh-external/dsh-right-sidebar/client` 合并 `ctx.rightSidebar`，并声明 session-scoped `rightbar.view` list slot。renderer owner props 保持 `{ instanceId }`，不包含 Host layout 或 group store。

```ts
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {
  RightbarViewOwnerProps,
  RightSidebarRestoreContext,
  RightSidebarSessionId,
} from '@dsh-external/dsh-right-sidebar/client'

export const inject = ['slots', 'rightSidebar']

function Editor({ instanceId }: RightbarViewOwnerProps) {
  return instanceId
}

export function apply(ctx: Context): void {
  ctx.slots.inject('rightbar.view', () => [
    ctx.slots.register({ name: 'rightbar.view', id: 'editor' }, Editor),
    ctx.rightSidebar.registerRestorer('editor', async ({
      sessionId,
      instanceId,
      descriptor,
    }: RightSidebarRestoreContext) => {
      await restoreEditorState(sessionId, instanceId, descriptor)
    }),
    ctx.rightSidebar.registerLauncher({
      id: 'editor',
      label: 'Editor',
      async open(sessionId: RightSidebarSessionId, selection?: unknown) {
        const documentId = typeof selection === 'string' ? selection : 'untitled'
        await ctx.rightSidebar.openInstance(sessionId, {
          id: `editor:${documentId}`,
          viewId: 'editor',
          title: documentId,
          restoreDescriptor: { documentId },
        })
      },
    }),
  ])
}

declare function restoreEditorState(
  sessionId: RightSidebarSessionId,
  instanceId: string,
  descriptor: unknown,
): Promise<void>
```

主要操作：

- `openInstance(sessionId, input, { target?, preview? })` 异步返回实际 group id。target 是 `{ groupId }`，或 `{ fromInstanceId, direction }`；direction 为 `center | left | right | up | down`。
- `getInstanceGroup()` 返回实例归属；`resolveTarget()` 只查找现有组，不修改布局。
- `pinInstance()` 固定 preview；`switchInstanceView()` 在相同 id、group 和顺序中切换已注册 renderer。
- `registerRestorer(viewId, callback)` 为持久化实例恢复 feature state。callback 在 durable-input 边界校验 opaque descriptor，并可返回 runtime-only `onClose`。
- `onClose` 只决定能否关闭；同步 `onClosed` 仅在 sidebar 提交删除该 exact instance 后释放 feature state。veto、stale 或 superseded 操作不会调用它，通知异常不会回滚已提交 layout。
- `activateInstance()`、`updateInstance()` 和 `closeInstance()` 分别负责激活、标题或 restore descriptor checkpoint 更新和安全关闭。并发关闭共享一次决策；过期完成不能删除 updated、moved、switched、restored 或 reopened instance。

`RightSidebarError` 提供稳定 code。预览 veto 是 `preview-vetoed`，较新的打开取代等待中的旧打开是 `superseded`，不可序列化 descriptor 是 `invalid-restore-descriptor`。所有输入验证先于 instance、layout 和 Host visibility 写入。

## 构建

在插件 checkout 中使用目标 Harness 的工具链和 Client packages：

```bash
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
```

该命令构建 Node no-op entry、browser declarations 和 browser bundle。它只重建本 checkout 的 `lib/` 并刷新本地 `node_modules` dependency links，不安装 profile、不应用 Host patch，也不重启服务。

## 安装与回撤

生命周期脚本会检查目标基线、Host patch 所有权和 setup receipt。运行前必须按当前 state 重新调查目标并获得外部写权限：

```bash
DSH_CHECKOUT=/root/deepseek-harness bash scripts/setup.sh
DSH_CHECKOUT=/root/deepseek-harness bash scripts/uninstall.sh
```

当前 grouped revision 尚未执行 candidate profile 安装或回撤。上述命令属于目标 realization 流程，不由本轮 build 结果证明。

## Host 源码补丁

[patches/deepseek-harness.patch](patches/deepseek-harness.patch) 绑定 Harness alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b`。它增加全局 navbar action seat、blank/new-session details 几何、普通宽度与最大化偏好、保留左栏的最大化布局、header clearance 和全高分隔条。

Grouped workbench 没有增加 `groupId` owner prop，也没有改变 Host slot catalog。升级 Harness 时，Agent 必须从 state 与新目标重新合成 realization；补丁可应用不等于目标仍满足当前意图。
