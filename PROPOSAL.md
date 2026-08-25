# dsh-right-sidebar 设计

> 本文是实现设计资料，不是当前语义权威。意图、约束和验收条件以 [.intent/state/STATE.md](.intent/state/STATE.md) 为准。

`dsh-right-sidebar` 是 DeepSeek Harness Web 的右栏平台底座。它提供全高布局、可注册标签页、显隐与宽度管理，以及主界面和右栏共享会话状态的接入方式；它不提供审阅、终端、浏览器、文件、Git、工具详情或其他业务功能。

## 目标

- 右栏占据应用内容区的完整高度，并作为第三列参与横向布局；它不是覆盖主界面的浮层。
- 用户可从应用 navbar 显示或隐藏右栏，也可从右栏内部收起右栏。
- 用户可拖动分隔条调整宽度；刷新后保留最后一次非零宽度，但右栏仍按默认隐藏策略启动。
- 插件可像 VS Code 视图容器一样注册、排序和卸载右栏标签页；底座不内置业务标签页。
- 一个功能插件可在主界面和右栏各注册一个交互入口，并让两处通过同一份 session-scoped 状态和动作保持同步。
- 本地 checkout 通过 profile 的 `link:` 依赖装配；更新 checkout 并重新构建、执行 `systemctl restart dsh-web` 后即可加载新版本。

## 非目标

- 不内置文件、Git、终端、浏览器、审阅、工具详情或会话分析功能。
- 不复制官方 ChatView、trajectory 或左侧栏的业务实现。
- 不通过 `position: fixed`、DOM 查询或私有 store 访问控制主界面。
- 不持久化右栏是否打开、当前 session、窄屏派生状态或整个布局 store。
- 不把某个功能插件的消息折叠、跳转目标或 session 展示模式固化为右栏平台字段。

## 布局与交互

右栏复用 Harness `ui-layout` 的 `details` 列几何：`sidebar | minmax(0, 1fr) | details`。右栏宽度直接参与主界面排版，内容区随右栏宽度缩放；右栏使用官方拖拽分隔条和窄视口降级规则。

平台接管 `details` single slot，并在其中渲染标签导航与活动标签内容。当前官方 GUI 没有生产交互会打开官方 DetailsPanel；工具行检查进入 trajectory，因此平台不重嵌 `conversation.details.tool`，也不把官方工具详情作为默认标签。

显隐入口属于应用级 navbar，而不是某个 session 内容组件。随包维护的 Harness 补丁增加 additive `shell.navbar.action` slot，使空白会话和任意主视图都能显示右栏按钮。

右栏内部始终提供收起按钮。navbar 按钮与栏内按钮调用同一组 layout 动作，且 `aria-pressed`、可见性和实际列宽保持一致。

宽度偏好是独立的用户布局设置：只记录最后一次非零 details 宽度并限制在官方范围内；关闭、session 切换和窄视口派生为零宽时不得覆盖该偏好。刷新后平台从该偏好恢复拖拽宽度，但不自动打开右栏。

Harness 补丁由 `ui-layout` 自己持久化最后一次非零宽度：通用 store persistence 支持选择顶层 durable keys，layout 仅选择 `detailsWidth`。`detailsOpen`、sidebar 和窄屏派生状态仍从 fresh `init()` 启动。

## 标签页注册

平台声明 session-scoped `rightbar.tab` list slot。每个贡献必须提供稳定 `id`、标签、排序值和组件；图标作为可选展示元数据。活动标签按 session 保存为交互状态，不作为长期用户设置。标签导航采用横向 tab strip，右栏较窄时可以水平滚动。

标签页容器负责以下行为：

- 按 slot ledger 的胜出顺序显示标签；
- 每次只渲染活动标签；
- 活动标签卸载后选择下一个可用标签；
- 没有标签时显示平台空态，不注册示例或默认业务标签；
- HMR 或插件卸载时移除对应标签和资源，不留下样式、状态或注册项。

第三方标签组件通过标准四 shares 获取运行时 session hooks（`PropsRuntime`）、子 slot renderer（`PropsRenderSlots`）、entry store（`PropsStore`）和 injected callbacks；组件不接收 `ctx`，也不自行订阅外部对象。

## 主界面与右栏状态同步

右栏平台提供接入规则，不解释功能状态。需要双向交互的功能插件在自己的 `apply()` 中创建一个 session-scoped store handle，并把同一个 handle 传给主界面贡献和 `rightbar.tab` 贡献。两处都通过 `useStore` 读取、通过声明的 actions 修改，因此任一侧点击产生的状态变化都会同步到另一侧。

通过 `@dsh-std/ui-browser` 接入的可移植右栏组件会收到 `SidebarViewProps.sessionId`。该值只是功能插件划分自有状态的会话键；主界面贡献仍需通过它所使用的 surface 协议获得同一 session identity。右栏 shell 和 adapter 不持有功能状态，也不解释折叠、跳转或选择语义。

例如，功能插件可以在自己的 store 中定义消息折叠集合、跳转目标或活动 session 视图；这些字段及其语义由该功能插件拥有，不属于 `dsh-right-sidebar`。测试夹具可以使用简单的选择值证明双向同步，但生产包不附带示例功能标签。

主界面贡献优先使用现有 additive slots，例如 `conversation.view` 或 `conversation.chat.node`。若功能必须控制官方 ChatView 本身的消息折叠、滚动定位或视图选择，Harness 必须先提供公开的 session-scoped action API；右栏插件不得操作 DOM、导入 `ui-conversation` 私有 store 或复制 ChatView。该 API 只暴露定位和展示动作，业务状态仍由调用方拥有。

状态作用域分为两类：

- 应用级布局状态：右栏显隐、最后一次非零宽度；
- session-scoped 功能状态：活动标签及第三方功能自己的选择、折叠、跳转或展示状态。

切换 session 时，活动标签和功能状态随 session 切换，宽度偏好不变；layout 保留官方的 session 切换关闭策略。右栏显隐不由某个功能标签修改。

## 包装与装配

本包同时提供 Node no-op half、browser half 和 bundle patch。`package.json` 必须声明 `dsh.bundle.patch` 与 `dsh.client`，`cordis.patch.yml` 使用实际包名 `@dsh-external/dsh-right-sidebar` 注册 loader entry。

本地开发采用 profile link：

```bash
dsh plugin --profile web add /root/dsh-right-sidebar
dsh --profile web --dump-config
```

profile 将依赖记录为 `link:/root/dsh-right-sidebar`。后续更新流程是拉取或修改 checkout、重新构建、执行 `systemctl restart dsh-web`；不需要再次复制插件源码。卸载使用：

```bash
dsh plugin --profile web remove @dsh-external/dsh-right-sidebar
```

开发期可使用 super-injector 的 build/inject/reload/uninject 工具缩短迭代，但它不是发布安装协议。GitHub 或 npm 安装必须能自行得到 `lib/index.js`、`lib/client.js` 和公开声明文件；发布包不得依赖开发机上未声明的 checkout symlink。

## Harness 源码改动

`dsh.bundle.patch` 只组合 Cordis 配置行，不修改 Harness TypeScript 源码。Harness 源码补丁由本仓库的 `patches/deepseek-harness.patch` 跟踪，基于官方 commit `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`。升级 Harness 时由 agent 根据新的官方代码手动更新补丁并处理冲突，不增加自动 apply/revert 或兼容层。

## 验收

平台底座满足以下行为后才可发布：

1. 右栏全高占据第三列，打开后改变主界面可用宽度，关闭后不遮挡或截获主界面事件。
2. 全局 navbar 按钮可显示和隐藏右栏，栏内按钮可收起右栏；两处状态和无障碍属性一致。
3. 官方分隔条可调整宽度，宽度限制遵循 `ui-layout`；刷新后恢复最后一次非零宽度但默认保持隐藏。
4. 外部测试插件可注册至少两个标签、在可滚动的横向 tab strip 中切换标签并卸载；生产包本身没有业务标签。
5. 测试插件在主界面和右栏使用同一个 session store；任一侧修改测试状态，另一侧立即反映，切换 session 后各 session 状态独立。
6. 本地 `dsh plugin --profile web add <checkout>` 形成 `link:` 依赖；重新构建并执行 `systemctl restart dsh-web` 后加载 checkout 更新，remove 后配置和 UI 注册全部消失。
7. 注入、HMR、session 切换、窄视口和卸载不会留下重复 slot、样式或订阅。
8. 任何 Harness 源码补丁都由本插件仓库跟踪，并标明其官方 Harness 基线 commit。

## 已落地的 Harness 前置

随包补丁已补齐两个平台能力：

1. 应用级 additive navbar action slot，用于在无 session 和任意主视图中放置右栏显隐按钮。
2. 只持久化 details 最后一次非零宽度的 layout 偏好/API，保持显隐状态、sidebar 宽度和窄屏派生状态为瞬态。

控制官方 ChatView 的折叠、跳转或 session 展示不是右栏基本渲染的前置；首个需要这些动作的功能插件必须同时补齐相应的公开 conversation action API 和覆盖。
