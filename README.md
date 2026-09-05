# @dsh-external/dsh-right-sidebar

DeepSeek Harness Web 的右栏工作台底座。它复用 Host 的全高 `details` 真列，为每个 session 保存可分栏的标签组、预览生命周期、横向或纵向标签、尺寸偏好和浏览器恢复信息。

本包不注册 Files、审阅、终端、浏览器、Git、工具详情或其他业务功能。功能插件拥有启动器、renderer、恢复描述符、关闭决策以及编辑器或选择器状态；右栏 runtime 只拥有布局树和实例归属。布局宽度、显隐与最大化仍由 Host `ctx.layout` 持有。

当前意图、realization 状态和稳定 client API 见 [.intent/state/STATE.md](.intent/state/STATE.md)，目标相关布局改动见 [patches/deepseek-harness.patch](patches/deepseek-harness.patch)。源码构建和测试不代表 profile 安装、live browser 验收或 realization activation。

## 工作台行为

- 每个 session 只有一棵布局树。split 保存横向或纵向比例；leaf group 保存标签顺序、活动实例、标签方向和纵向栏宽。
- 每组最多一个斜体 preview。打开下一个 preview 会先等待旧 preview 的关闭决策；veto 取消新打开。双击标签或功能首次编辑时调用 `pinInstance()` 固定 preview。
- 相对打开由 runtime 集中解析。现有目标按几何距离选择，tree preorder 打破平局；没有目标时才在来源组旁创建 50/50 split。
- 拖动到内容四边 10% 区域时在内容矩形内预览半区，drop 才创建 split；内容中心 drop 加入目标组。纵向轨道右边的内容左缘仍可向左分栏。整个标签栏（含空白与固定按钮）仅用于组内排序或跨组插入，深色插入线随指针标出前后位置；纵向标签用横线，横向标签用竖线。显式移动会固定 preview，空的非 root 组折叠。
- tab 拖动只写 sidebar 自有 MIME，并在 content capture phase 完成内部 drop，避免 CodeMirror 等 feature editor 把 instance id 当文本插入；普通外部文本与文件 drop 不被拦截。
- 顶部横向标签与 Host controls 同行，右上组通过 `--dsh-shell-navbar-width` 预留空间。纵向右上组为 tab rail 和内容保留本地 clearance；可滚动标签不覆盖 Host controls。
- 标签仅保留标题与关闭按钮，不提供三点按钮或移动/分栏菜单。拖拽负责排序和分栏，双击固定 preview，现有键盘快捷键保留。
- 纵向标签标题、图标、新增与方向切换按钮左对齐。横向标签栏将普通滚轮、Shift 滚轮和触控板横向输入用于水平滚动；Ctrl 缩放保留，仅实际滚动时拦截事件，到达边缘或无溢出时继续传递。
- group 顶栏只保留 launcher 与当前组横纵切换；新分组的默认方向在 launcher home 使用明确文字设置。
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

在插件 checkout 中使用目标 Harness 的工具链和 Client packages：

```bash
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
```

该命令构建 Node no-op entry、browser declarations 和 browser bundle。它只重建本 checkout 的 `lib/` 并刷新本地 `node_modules` dependency links，不安装 profile、不应用 Host patch，也不重启服务。

## 安装、维护与移除

从 [STATE 操作地图](.intent/state/STATE.md#installation-maintenance-and-removal) 选择入口并确认目标、消费者和权限。当前脚本默认 profile 为 `web`，可用 `DSH_PROFILE` 指定；`DSH_CHECKOUT` 指向已准备好依赖和工具链的 Harness Git checkout。私有 `DSH_HOME` 只隔离 CLI profile 数据，Host 补丁和构建仍写入指定 checkout。

```bash
DSH_CHECKOUT=/root/deepseek-harness DSH_PROFILE=web bash scripts/setup.sh
```

[setup.sh](scripts/setup.sh) 按顺序检查补丁正向或反向可应用性、应用缺失补丁、检查源码标记、执行 `gen-client-catalog` 与 `gen-cordis-api`、写入 Git 私有目录中的 `dsh-right-sidebar.patch-state` receipt、重建 Host libraries 和 Web、构建插件，最后调用 `dsh plugin --profile "$PROFILE" add .`。它优先使用 PATH 上的 `dsh`，再回退到 checkout 的构建 CLI 或 pnpm source launcher；必须确认命令对应目标安装。脚本不执行服务重启。

安装不是原子事务：目录生成失败时 Host 补丁可能已应用而 receipt 尚未写入；Host 构建失败时 receipt 可能已存在。遇到失败先核对源码、receipt、构建产物和 profile，不应重复运行来推断首次写入的所有权。脚本检查适用性而不强制 Host HEAD 等于补丁基线。CLI 不存在时脚本只打印手动注册命令，因此退出成功也不是安装完成证据。

Host 支持已就绪且仅更新插件时，运行 [build.sh](scripts/build.sh)；需要登记 profile 时使用 `dsh plugin --profile web add /absolute/plugin-checkout`。该命令不补齐 Host 源码能力。Host 漂移维护应检查被修改的源文件、共享消费者和生成目录，再选择重建或适配补丁，不能强套历史补丁。

```bash
DSH_CHECKOUT=/root/deepseek-harness DSH_PROFILE=web bash scripts/uninstall.sh
```

[uninstall.sh](scripts/uninstall.sh) 仅在 receipt digest 匹配、`patch_applied_by_setup=true` 且反向检查通过时反转整份 Host 补丁，随后重新生成目录并重建 Host；它最后才移除 profile 包。receipt 缺失或不匹配、外部所有权、重叠修改都会保留 Host 文件。脚本不会检测其它插件对共享源码的依赖，也不能做部分所有权转移；执行前必须完成 [消费者检查](.intent/state/STATE.md#host-prerequisites-and-shared-ownership)。`dsh plugin remove` 失败会被捕获并打印说明，末尾的完成提示不能证明移除成功；生成或构建失败也可能在 profile 移除前中止。

每次安装或移除后，都按 [完成条件](.intent/state/STATE.md#observable-completion-and-limits) 核对依赖、lockfile、实际解析路径、Bundle、组合配置和 Host 源码。生成目录从剩余源贡献重新生成；忽略目录中的旧 bundle 不会因为 Git 源码回退而消失。浏览器布局与草稿不由卸载脚本清除。历史部署记录存在，但 grouped revision 的目标漂移维护与拥有权回撤尚无演练证据。

## Host 源码补丁

[patches/deepseek-harness.patch](patches/deepseek-harness.patch) 绑定 Harness alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b`。它增加全局 navbar action seat、blank/new-session details 几何、普通宽度与最大化偏好、保留左栏的最大化布局、header clearance 和全高分隔条；并在 Host store 及 slot store API 增加选定字段持久化，使宽度和最大化偏好持久保存、可见性保持临时状态。

Grouped workbench 没有增加 `groupId` owner prop，也没有改变 Host slot catalog。升级 Harness 时，先按 STATE 检查目标差异与消费者，再决定保留、修复或重新生成适配；补丁可应用不等于目标仍满足当前意图。
