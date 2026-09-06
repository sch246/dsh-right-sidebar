# @dsh-external/dsh-right-sidebar

DeepSeek Harness Web 的右栏工作台底座。它复用 Host 的全高 `details` 真列，为每个 session 保存可分栏的标签组、预览生命周期、横向或纵向标签、尺寸偏好和浏览器恢复信息。

本包不注册 Files、审阅、终端、浏览器、Git、工具详情或其他业务功能。功能插件拥有启动器、renderer、恢复描述符、关闭决策以及编辑器或选择器状态；右栏 runtime 只拥有布局树和实例归属。布局宽度、显隐与最大化由 Host `ctx.layout` 按 session 保存，切换与刷新恢复目标 session 自己的状态；没有保存记录的 session 默认收起。

当前意图、realization 状态和稳定 client API 见 [.intent/state/STATE.md](../../.intent/state/STATE.md)，目标相关布局改动见 [patches/deepseek-harness.patch](patches/deepseek-harness.patch)。源码构建和测试不代表 profile 安装、live browser 验收或 realization activation。

## 工作台行为

- 每个 session 只有一棵布局树。split 保存横向或纵向比例；leaf group 保存标签顺序、活动实例、标签方向和纵向栏宽。
- 每组最多一个斜体 preview。打开下一个 preview 会先等待旧 preview 的关闭决策；veto 取消新打开。双击标签或功能首次编辑时调用 `pinInstance()` 固定 preview。
- 相对打开由 runtime 集中解析。现有目标按几何距离选择，tree preorder 打破平局；没有目标时才在来源组旁创建 50/50 split。
- 拖动到内容四边 10% 区域时在内容矩形内预览半区，drop 才创建 split；内容中心 drop 加入目标组。纵向轨道右边的内容左缘仍可向左分栏。整个标签栏（含空白与固定按钮）仅用于组内排序或跨组插入，深色插入线随指针标出前后位置；纵向标签用横线，横向标签用竖线。显式移动会固定 preview，空的非 root 组折叠。
- tab 拖动只写 sidebar 自有 MIME，并在 content capture phase 完成内部 drop，避免 CodeMirror 等 feature editor 把 instance id 当文本插入；普通外部文本与文件 drop 不被拦截。
- 顶部横向标签与 Host controls 同行，右上组通过 `--dsh-shell-navbar-width` 预留空间。纵向右上组为 tab rail 和内容保留本地 clearance；可滚动标签不覆盖 Host controls。
- 标签仅保留标题与关闭按钮，不提供三点按钮或移动/分栏菜单。拖拽负责排序和分栏，双击固定 preview，现有键盘快捷键保留。
- 纵向标签标题、图标、新增与方向切换按钮左对齐。横向标签栏将普通滚轮、Shift 滚轮和触控板横向输入用于水平滚动；Ctrl 缩放保留，仅实际滚动时拦截事件，到达边缘或无溢出时继续传递。
- group 顶栏只保留 launcher 与当前组横纵切换；新分组的默认方向在 launcher home 用“横向／纵向”单选项设置，标题与选项保持单行，选中项表示当前默认值；“仅影响之后新建的分组”通过鼠标悬浮提示提供。
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
- `registerRestorer(viewId, callback)` 为持久化实例恢复 feature state。callback 在 durable-input 边界校验 opaque descriptor，并可返回 runtime-only close callbacks 与同步 `onRestored`。`onRestored` 仅在 exact restoration 提交 ready 后调用，供 feature flush 恢复期间发现的 descriptor，不依赖 timer。
- `onClose` 只决定能否关闭；同步 `onClosed` 仅在 sidebar 提交删除该 exact instance 后释放 feature state。veto、stale 或 superseded 操作不会调用它，通知异常不会回滚已提交 layout。
- `activateInstance()`、`updateInstance()` 和 `closeInstance()` 分别负责激活、标题或 restore descriptor checkpoint 更新和安全关闭。并发关闭共享一次决策；过期完成不能删除 updated、moved、switched、restored 或 reopened instance。

`RightSidebarError` 提供稳定 code。预览 veto 是 `preview-vetoed`，较新的打开取代等待中的旧打开是 `superseded`，不可序列化 descriptor 是 `invalid-restore-descriptor`。所有输入验证先于 instance、layout 和 Host visibility 写入。

## 构建

从仓库根目录使用本地固定版本工具和目标 Harness 的 Client 声明；插件包位于 `packages/dsh-right-sidebar/`：

```bash
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
```

该命令构建 Node no-op entry、browser declarations 和 browser bundle。它只重建 `packages/dsh-right-sidebar/lib/` 并刷新仓库根 `node_modules` dependency links，不安装 profile、不应用 Host patch，也不重启服务。

## 安装、维护与移除

从 [STATE 操作地图](../../.intent/state/STATE.md#installation-maintenance-and-removal) 选择入口，显式设置目标 Harness、Home 和 profile。私有 `DSH_HOME` 隔离 profile，Host 修改仍落在 `DSH_CHECKOUT`；安装探针同时需要独立 checkout。

```bash
DSH_CHECKOUT=/absolute/harness DSH_HOME=/absolute/home DSH_PROFILE=web pnpm run setup --check
DSH_CHECKOUT=/absolute/harness DSH_HOME=/absolute/home DSH_PROFILE=web pnpm run setup --install
DSH_CHECKOUT=/absolute/harness DSH_HOME=/absolute/home DSH_PROFILE=web pnpm run uninstall --check
DSH_CHECKOUT=/absolute/harness DSH_HOME=/absolute/home DSH_PROFILE=web pnpm run uninstall --remove
```

[setup.sh](../../scripts/setup.sh) 默认只检查 Host 补丁及标记；安装模式应用所需补丁、更新归属记录和共享 catalogs、构建 Host/插件，再使用所选 checkout 的 `dsh plugin add` 登记实际子包路径。命令失败直接返回，不能把退出或补丁可应用性当成浏览器验收。已准备好 Host 的插件更新可单独运行 build，再通过 `dsh plugin add` 更新 profile。

[uninstall.sh](../../scripts/uninstall.sh) 默认检查；移除模式先拒绝仍被 profile 包的 dependencies、peerDependencies 或 Client inject 使用的 sidebar，然后依据确切 receipt 检查 Host 回撤。还应检查依赖共享 Host 源码但不直接声明 sidebar 的其他消费者；这种部分所有权转移不能由整份补丁回撤替代。profile 移除失败会直接报错，不吞掉失败或提示手工清理为成功。

所有操作都不重启服务。profile 的依赖、lockfile、实际链接、Bundle、生成输出和 Host 归属需分别核对；中断后根据实际结果恢复，不假定前序操作回滚。浏览器存储和用户文件不由包卸载删除。

## Host 源码补丁

[patches/deepseek-harness.patch](patches/deepseek-harness.patch) 绑定 Harness alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b`。它增加全局 navbar action seat、blank/new-session details 几何、普通宽度与最大化偏好、保留左栏的最大化布局、header clearance 和全高分隔条；并在 Host store 及 slot store API 增加选定字段持久化，将每个 session 的宽度、显隐和最大化持久保存。旧版全局偏好无法归属具体 session，不会用于初始化所有 session。

Grouped workbench 没有增加 `groupId` owner prop，也没有改变 Host slot catalog。升级 Harness 时，先按 STATE 检查目标差异与消费者，再决定保留、修复或重新生成适配；补丁可应用不等于目标仍满足当前意图。
