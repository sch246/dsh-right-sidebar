# dsh-right-sidebar 实现状态

[.intent/state/STATE.md](.intent/state/STATE.md) 是当前语义权威；[PROPOSAL.md](PROPOSAL.md) 是实现设计资料。本文件只记录当前实现、装配状态与验证证据。

## 已实现

- Node half 为 no-op；browser half 接管官方 `details` 真列并声明 session-scoped `rightbar.tab` list slot。
- 生产包不注册任何业务标签；零贡献时显示平台空态。
- 标签按 `order` 排列，一次只渲染活动项；活动贡献卸载后回退到首个可用项；支持左右方向键、Home 和 End。
- 全局按钮注册到官方补丁新增的 `shell.navbar.action`；开合状态和动作直接来自 layout owner props，没有镜像 store。
- details 宽度不再以“已有非空会话”为前提；blank session 和没有 current session 的新会话界面都能在首条消息前通过全局按钮展开。
- 栏内收起按钮调用同一官方 layout 服务；它位于标题左侧，不与右上角全局按钮重叠。
- 官方 layout store 将 `detailsWidth` 与 `detailsOpen` 分离，只持久化宽度。刷新默认关闭，再展开恢复最后一次拖拽宽度。
- 功能插件可创建一个 session-scoped store handle，并把同一个 handle 交给自己的主界面贡献和 `rightbar.tab` 贡献，实现双向同步；平台不解释折叠、跳转或 session 视图等业务字段。
- browser half 通过 framework `InjectFace`/`useTabs` 订阅标签 ledger；没有组件内手写 `useSyncExternalStore`、`ResizeObserver`、DOM 查询或私有 conversation store。
- package 同时声明 `dsh.bundle.patch` 与 `dsh.client`；profile 使用 `link:/root/dsh-right-sidebar`。

## 官方补丁

- 文件：`patches/deepseek-harness.patch`
- 官方基线：`b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- 内容：`shell.navbar.action`、选择性 store 持久化、details 宽度/开合分离及对应测试和生成目录。
- 已在该基线的临时 worktree 上通过 `git apply --check`。

升级 Harness 时由 agent 手动重放和处理冲突；不提供 apply/revert 脚本或兼容中间层。

## 当前装配

- Web profile dependency：`@dsh-external/dsh-right-sidebar: link:/root/dsh-right-sidebar`
- Web profile bundle 尾项：`@dsh-external/dsh-right-sidebar`
- 服务：`systemctl dsh-web`，当前已重启并加载本地构建。
- 2026-08-26 09:44 CST 已为新会话可见性修复重建 `ui-layout` 与插件并重启服务；本地与公网入口在首次检查均返回 200。
- 用户随后在实际浏览器中确认新会话首条消息前的右栏展开行为通过。

## 验证

- 插件 build：通过，生成 `lib/index.js`、`lib/client.js` 与公开声明。
- 插件 Vitest：11/11 通过，包含不依赖 dsh-std 的外部消费者注册、owner 撤回、重挂载与完整 teardown。
- Harness `ui-layout` 定向测试：6 个文件、62/62 通过。
- client catalog 与 Cordis API 生成校验：通过。
- 全部 client bundles + web frontend production build：通过。
- 真实 Chromium：全局展开、栏内收起、第三列横向挤压、拖拽、刷新默认关闭、460px 宽度恢复和零 console/page error 全部通过。
- Harness `test:gui`：282 个文件通过、4 个失败；失败均由当前工作树已有的 `ui-settings` 强制 Host 模式改动引起，与本补丁无交集。
- `DSH_SNAPSHOT=replay pnpm run test:web`：在 Host 类型构建阶段被当前工作树已有的 `agent-loop`/`session repair` 测试类型错误阻断；绕过损坏的 Host 测试声明后，client 和 web production build 通过。

控制官方 ChatView 的消息折叠、跳转或 session 展示不是此底座职责。首个需要这些动作的功能插件应同时为 `ui-conversation` 增加最小公开 session action API；不得由右栏平台操作 DOM 或私有 store。
