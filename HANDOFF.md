# dsh-right-sidebar alpha.2 实现状态

[.intent/state/STATE.md](.intent/state/STATE.md) 是当前语义权威；[PROPOSAL.md](PROPOSAL.md) 是实现设计资料。本文件只记录当前实现、装配状态与验证证据。

## 已实现

- Node half 为 no-op；browser half 通过 Cordis `Context` 和 renderer-owned `SlotRegistry` 接管官方 `details` 真列并声明 session-scoped `rightbar.tab` list slot。
- 生产包不注册任何业务标签；零贡献时不渲染 tab chrome、提示或占位内容。
- 标签按 `order` 排列，一次只渲染活动项；活动贡献卸载后回退到首个可用项；支持左右方向键、Home 和 End。
- 全局按钮注册到官方补丁新增的 `shell.navbar.action`；Host owner props 提供解析后的显隐状态，按钮通过 alpha.2 原生 `ctx.layout` 服务开合 details，没有镜像 store。
- details 宽度不再以“已有非空会话”为前提；blank session 和没有 current session 的新会话界面都能在首条消息前通过全局按钮展开。
- 右栏内部不提供第二个开合按钮。
- 官方 layout store 将 `detailsWidth` 与 `detailsOpen` 分离，只持久化宽度。刷新默认关闭，再展开恢复最后一次拖拽宽度。
- 功能插件可创建一个 session-scoped store handle，并把同一个 handle 交给自己的主界面贡献和 `rightbar.tab` 贡献，实现双向同步；平台不解释折叠、跳转或 session 视图等业务字段。
- `activeTab` 使用 `@deepseek-ai/dsh-client-store` 的 session-scoped handle；组件通过 framework `InjectFace`/`useTabs` 订阅标签 ledger，没有手写外部订阅或私有 conversation store。
- public client coordinate 导出 `ctx.rightSidebar.openTab(sessionId, tabId)`、`RightSidebarService` 与 `RightSidebarOpenTabError`。details inject 提供 framework-resolved session/actions，panel 只在实际挂载期间激活 binding；调用方不会获得 store 或 actions。
- `openTab` 对未挂载、session 不匹配和未知 live tab 分别抛出稳定 code `not-mounted`、`session-mismatch`、`unknown-tab`；验证失败不写选择、不展开布局。binding 替换、panel 卸载与 Cordis plugin dispose 都会清除 stale actions。
- package 同时声明 `dsh.bundle.patch` 与 `dsh.client`；profile 使用 `link:/root/dsh-right-sidebar`。

## alpha.2 Host 补丁

- 文件：`patches/deepseek-harness.patch`
- 官方基线：`0a53fb55bea101816fa226bb964ae2bed71c343b`
- 内容：`shell.navbar.action`、blank/new-session details 几何、header clearance、选择性 store 持久化、details 宽度/开合分离及无浮动 grip 的原生拖拽分隔条。
- 补丁只拥有 Host 源码区域；slot/API catalog 在 setup 和 uninstall 时从剩余源贡献重生成。
- alpha.2 Host patch 不增加或修改行为测试。

升级 Harness 时由 agent 调查并重组补丁；setup/uninstall 只接受完全匹配的 patch 或 reverse，不适配漂移，也不提供兼容路径。

## 当前重合成状态

- alpha.2 重合成只形成未封锁的源码和 Host patch；它未声明 profile 安装、服务重启或 live browser 验收。
- setup/uninstall 以补丁 SHA-256 与 `patch_applied_by_setup` 收据约束 Host 反向操作，并重建受影响的静态 Client libraries、动态 UI bundles、Web frontend 与共享 catalog。

## 机械验证

- 最终补丁在隔离 alpha.2 Host 上通过 reverse、forward、再次 reverse 与 clean-tree forward check。
- Host 生产 package 类型构建与插件类型检查通过。
- 受影响的 Host Client libraries、动态 UI bundles、Web frontend 和插件构建通过。
- 共享 Client/Cordis catalog 在补丁正向和回撤状态都成功生成；回撤后 Host tracked tree 干净。
- 行为测试、profile 安装、服务重启和 browser 验收不属于本次证据。

本次稳定打开 API 在隔离 worktree 中通过以下验证：

- `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh`：Node entry、client declarations 和 browser bundle 构建通过；公开声明包含 Context augmentation、service、session id alias 和稳定错误类型。
- `node node_modules/vitest/vitest.mjs run tests/open-tab-api.client.spec.ts tests/right-sidebar.client.spec.tsx tests/registration-contract.client.spec.ts`：3 个文件、15 个测试通过，覆盖成功选择后展开、未知 tab 零副作用、session mismatch、未挂载、binding 替换、panel cleanup、plugin dispose 和重挂载。

这些结果是源码和组件/runtime fixture 证据，不代表 profile 安装、服务重启、live browser 验收或 alpha.2 realization 选择。

控制官方 ChatView 的消息折叠、跳转或 session 展示不是此底座职责。首个需要这些动作的功能插件应同时为 `ui-conversation` 增加最小公开 session action API；不得由右栏平台操作 DOM 或私有 store。
