# dsh-right-sidebar 实现设计

> 本文是实现资料，不是语义权威。意图、稳定 API 与验收条件以 [.intent/state/STATE.md](.intent/state/STATE.md) 为准。

`dsh-right-sidebar` 是 DeepSeek Harness Web 的右栏工作台底座。browser half 运行在 Cordis `Context` 中，使用 renderer-owned `SlotRegistry` 注册界面，使用单一 runtime 保留各 session 的分组布局树。它不提供审阅、终端、浏览器、文件、Git、工具详情或其他业务功能。

## 职责划分

Host `ui-layout` 拥有 details 列的宽度、显隐、最大化、拖拽计算与响应式降级。插件只通过 `ctx.layout` 动作更改布局，不镜像 Host 状态。

`RightSidebarRuntime` 是每个 session 布局树的唯一权威。split 保存比例，leaf group 保存标签顺序、active instance、tab 方向和纵向 rail 宽度。panel 通过 `HostObservable` 读取投影，不创建 framework store、active-tab mirror 或第二份 ledger。

功能插件拥有 launcher callback、static view renderer、instance title、optional close veto 以及 editor/selector 内部状态。`instanceId` 是它从静态 renderer 返查业务状态的不透明标识；平台不解释其格式。

## 布局与全局控件

右栏接管 Harness `details` single slot，作为 `sidebar | minmax(0, 1fr) | details` 的第三列参与横向布局。它不使用 fixed overlay、DOM 查询或 Host 私有 store。

应用级 navbar 控件注册到 Host 提供的 `shell.navbar.action`。关闭时只显示一个未选中 sidebar icon；打开时先显示 maximize/restore，再显示选中的 sidebar icon。panel 内部不重复可见性控件。

Host patch 使 blank/new-session 界面也能在首条消息前显示 details，并将普通宽度与最大化偏好独立持久化。可见性不持久化。最大化保留左侧 session sidebar，将 center track 设为零，并让 details 使用剩余宽度。

## 注册、分组与恢复

panel 声明 session-scoped `rightbar.view` list slot。每个注册项只提供稳定 renderer id 和 component。渲染 active instance 时，panel 以 `{ instanceId }` 作为 owner props，并用 `only: viewId` 选择对应 renderer；group location 由公开 service 查询，不扩展 Host owner props。

launcher 是 service-owned lifecycle registration，包含 id、可延迟解析的 label 和 `open(sessionId, selection?)` callback。平台不自动注册 Files 或其他 launcher。

`openInstance()` 检查 runtime、mounted session、live view 和 JSON-safe restore descriptor，再集中解析 explicit 或 relative target。现有方向组按几何距离和 tree preorder 选择；缺失方向组建立 equal split。preview replacement 等待旧 preview 的 close decision，open generation 防止晚到请求覆盖更新选择。

重复 instance id 只激活已有实例；非 preview 打开同时固定它。`switchInstanceView()` 在同一 id、group 和顺序中替换 renderer 与 restore binding。`updateInstance()` 更改 title 或 JSON-safe restore descriptor checkpoint，不更改 renderer、group、顺序或 close callbacks。

布局和 opaque restore descriptor 写入 versioned browser storage。renderer 或 restorer 缺失时实例保留 placeholder；restorer rejection 保留可重试状态。restorer 可返回同步 `onRestored`，runtime 只在 exact restoring identity 提交 ready 并安装 close callbacks 后通知，使 feature 在明确 commit point flush 恢复期间发现的 descriptor。stale、failed、unregistered 或 disposed restoration 不通知，通知异常不回滚 ready。损坏的 durable tree 因 duplicate ids、multiple previews 或非法结构被拒绝，原始 JSON 留作恢复。

## Docking 与 renderer 保留

panel 从唯一布局树推导 leaf geometry。四边 10% hover 只显示 drop 后的 half-area；edge drop 建立 split，center 或 tab drop 加入目标组并决定顺序。tab drag 只携带 sidebar 自有 MIME；workspace 在 capture phase 处理落入 content 的已识别内部 drop，避免 child editor 消费 instance id。tab-bar target 继续在自身 bubble handler 排序，外部文本与文件 drop 不受影响。empty non-root group 折叠，显式移动固定 preview。

所有曾 active 的 renderer surface 是 workspace 的 stable-key sibling。active tab 跨组移动仍复用同一 React element；inactive surface 隐藏但不复制 feature state。浏览器恢复只加载每组 active instance，其余标签首次激活时再挂载。

顶部横向 tab 使用 Host 的 56px 行，右上 leaf 通过 `--dsh-shell-navbar-width` 保留 controls。非顶部组使用 compact chrome。纵向右上 leaf 为 rail 和 content 留出 local clearance。action menu 位于 scroll container 外，overflow 不会截断键盘替代入口。

## 关闭与竞态

`closeInstance()` 将同一 instance object 的并发关闭收敛到一个 Promise。`onClose()` 只决定能否关闭；返回 `false` 保留实例，rejection 不改 state 并保留给调用方。同步 `onClosed()` 只在 exact instance 从权威 layout 提交删除后释放 feature state；通知异常会报告但不回滚 layout。

关闭完成时以 session record 和 instance object identity 重新检查。关闭等待期间的 update、view lifecycle removal 或同 id reopen 会使旧完成失效，因此旧 callback 不能删除新实例，也不会触发 `onClosed()`。

panel binding 跟随已挂载 details occurrence。新 binding 立即使旧 binding callback 失效；panel unmount 只在自己仍为 current binding 时清除它。runtime dispose 清除 binding、launcher、restorer、session snapshots 和订阅，保留的 service 或 panel face 不能再写入。持久化布局不随 runtime dispose 删除。

## panel 交互

每个 group 的 labels 使用独立 scroll area，`+` 和当前组 orientation control 不参与滚动。新分组的默认方向在 launcher home 以明确文字设置，不增加顶栏图标。横向和纵向模式都保留 launcher、tab action 与 Host controls 的可达性。

tab 按方向支持 Arrow、Home 和 End；Alt+Shift+Arrow 提供 edge split keyboard path，action menu 提供 pin 和跨组移动。split 与 rail separator 支持 Arrow、reset、pointer capture 和 cancellation。

launcher 和 close rejection 会显示通用 operation error。操作进行期间对应控件不可重复触发。active view 使用 `Suspense` loading state 和内容 error boundary，一个 feature 失败不卸载工作台 shell。

## 包装与目标适配

本包提供 Node no-op entry、browser half 和 `dsh.bundle.patch`。`cordis.patch.yml` 使用包名 `@dsh-external/dsh-right-sidebar` 注册 loader entry。

Harness 源码补丁由 [patches/deepseek-harness.patch](patches/deepseek-harness.patch) 跟踪，当前绑定 alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b`。升级 Harness 时，Agent 根据 state 和新目标重新合成 realization；不为延用旧 patch 增加兼容路径。
