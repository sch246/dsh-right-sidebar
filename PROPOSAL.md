# dsh-right-sidebar 实现设计

> 本文是实现资料，不是语义权威。意图、稳定 API 与验收条件以 [.intent/state/STATE.md](.intent/state/STATE.md) 为准。

`dsh-right-sidebar` 是 DeepSeek Harness Web 的右栏工作台底座。browser half 运行在 Cordis `Context` 中，使用 renderer-owned `SlotRegistry` 注册界面，使用单一 runtime 保留各 session 的实例 ledger。它不提供审阅、终端、浏览器、文件、Git、工具详情或其他业务功能。

## 职责划分

Host `ui-layout` 拥有 details 列的宽度、显隐、最大化、拖拽计算与响应式降级。插件只通过 `ctx.layout` 动作更改布局，不镜像 Host 状态。

`RightSidebarRuntime` 是每个 session 的有序实例列表和 active instance 的唯一权威。panel 通过 runtime 提供的 `HostObservable` 读取投影；不创建 framework store、active-tab mirror 或第二份 ledger。

功能插件拥有 launcher callback、static view renderer、instance title、optional close veto 以及 editor/selector 内部状态。`instanceId` 是它从静态 renderer 返查业务状态的不透明标识；平台不解释其格式。

## 布局与全局控件

右栏接管 Harness `details` single slot，作为 `sidebar | minmax(0, 1fr) | details` 的第三列参与横向布局。它不使用 fixed overlay、DOM 查询或 Host 私有 store。

应用级 navbar 控件注册到 Host 提供的 `shell.navbar.action`。关闭时只显示一个未选中 sidebar icon；打开时先显示 maximize/restore，再显示选中的 sidebar icon。panel 内部不重复可见性控件。

Host patch 使 blank/new-session 界面也能在首条消息前显示 details，并将普通宽度与最大化偏好独立持久化。可见性不持久化。最大化保留左侧 session sidebar，将 center track 设为零，并让 details 使用剩余宽度。

## 注册与实例

panel 声明 session-scoped `rightbar.view` list slot。每个注册项只提供稳定 renderer id 和 component。渲染 active instance 时，panel 以 `{ instanceId }` 作为 owner props，并用 `only: viewId` 选择对应 renderer。

launcher 是 service-owned lifecycle registration，包含 id、可延迟解析的 label 和 `open(sessionId, selection?)` callback。平台不自动注册 Files 或其他 launcher。

`openInstance()` 按固定顺序执行：检查 runtime 未销毁，检查已挂载 details 的 session，检查 `viewId` 存在于 live `rightbar.view` ledger，然后追加或激活实例，最后调用 `ctx.layout.openDetails()`。验证失败不写 instance state 或 layout。

重复 instance id 只激活已有实例，不替换它的 view、title 或 close callback。`updateInstance()` 只更改 title，不改变顺序或选择。

view registration 离开 live ledger 时，runtime 同步删除所有 session 中引用该 renderer 的实例。这是 registration lifecycle cleanup，不执行 `onClose`。active instance 被移除时选择其后第一个存活实例，否则选择前一个；无存活实例则进入 launcher home。

## 关闭与竞态

`closeInstance()` 将同一 instance object 的并发关闭收敛到一个 Promise。`onClose()` 返回 `false` 保留实例；rejection 不改 state 并保留给调用方。

关闭完成时以 session record 和 instance object identity 重新检查。关闭等待期间的 update、view lifecycle removal 或同 id reopen 会使旧完成失效，因此旧 callback 不能删除新实例。

panel binding 跟随已挂载 details occurrence。新 binding 立即使旧 binding callback 失效；panel unmount 只在自己仍为 current binding 时清除它。runtime dispose 清除 binding、launcher、session snapshots 和订阅，保留的 service 或 panel face 不能再写入。

## panel 交互

顶行将 instance labels 放在独立的横向 scroll area，`+` 是不参与滚动的 launcher 入口。tabbar 用 `--dsh-shell-navbar-width` 预留 Host navbar controls，fallback 为 80px。窄宽度优先保留 launcher 与 Host controls 的可达性。

tab 支持 ArrowLeft、ArrowRight、Home 和 End，每个 close button 拥有包含 title 的 locale-owned accessible label。active instance 改变后，panel 将焦点移到新 active tab；进入 launcher home 时移到 `+`。

launcher 和 close rejection 会显示通用 operation error。操作进行期间对应控件不可重复触发。active view 使用 `Suspense` loading state 和内容 error boundary，一个 feature 失败不卸载工作台 shell。

## 包装与目标适配

本包提供 Node no-op entry、browser half 和 `dsh.bundle.patch`。`cordis.patch.yml` 使用包名 `@dsh-external/dsh-right-sidebar` 注册 loader entry。

Harness 源码补丁由 [patches/deepseek-harness.patch](patches/deepseek-harness.patch) 跟踪，当前绑定 alpha.2 commit `0a53fb55bea101816fa226bb964ae2bed71c343b`。升级 Harness 时，Agent 根据 state 和新目标重新合成 realization；不为延用旧 patch 增加兼容路径。
