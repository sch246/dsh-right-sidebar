# dsh-right-sidebar · 干净、强大的右侧边栏插件 —— 开发方案（前置版 v0）

> 状态：规划已定（M0 未开工）。本文档只做方案，不动代码、不安装任何东西。

## 1. 目标与定位

- **干净**：基于 DSH 官方 slot 体系实现，不 `position:fixed` 浮层盖在官方列上；从零写，不 fork 社区代码；注入即生效、卸载即净。
- **平台化（已拍板）**：tab 不内置功能，而是**开放注册** —— 第三方插件可向我们的侧边栏注册自己的 tab；底座本身**不做文件 / Git / 终端**。默认仅一个「详情」tab（收编官方工具详情座位，属于底座职责）。
- **发布形态**：独立文件夹仓库，参考本机 [`/root/dsh-warm-minimal`](/root/dsh-warm-minimal) 的布局（`package.json` + `dsh.bundle.patch` → `cordis.patch.yml` + `scripts/` + `README` + `LICENSE`）；本地注入验证稳定后发 GitHub Release pre-release。

## 2. 为什么现有插件「不够干净」

| 插件 | 不干净的点 |
|---|---|
| dsh-side-panel / DDDFXYqiming fork | `position:fixed` 浮层叠在官方 detailsCol 上，**遮挡官方「工具调用详情」面板**；fork 还基于已归档上游 + sourcemap 恢复源码 |
| webkong/dsh-plugin-sidebar、dsh-solution-explorer 等 | 同样是脱离官方布局的浮层/覆盖式挂载，宽度越界、和官方三列布局脱节 |

关键事实：官方布局其实**有正规的右侧座位** —— `details` 列（300–520px、AppFrame 自带拖拽把手、`ctx.layout` 开关），只是被官方 DetailsPanel 独占。所以「干净」的正确答案不是再盖一层浮层，而是**接管 `details` 列，把官方工具详情座位重新嵌进我们面板的 tab 里**。

## 3. 架构（关键技术点，已对照源码核实）

- **形态**：`ui-panel`（纯浏览器端 UI 插件，不需要 Node half；tab 功能方各自决定是否需要自己的 host half）。
- **挂载点**：`ctx.slots.inject('details', () => ctx.slots.register({ name: 'details', children: { 'conversation.details.tool': ... } }, RightSidebarPanel))`。
  - `details` 是 single slot：动态注册条目会 shadow 官方 DetailsPanel（`packages/client/runtime/src/client/slots.ts` 已确认该语义）。
  - 必须在 children 里**重新声明 `conversation.details.tool` 并原样 `renderSlot`**，把官方工具详情内容完整保住在我们面板的「详情」tab 里 —— 这是与现有插件本质不同的地方：不是遮挡它，而是收编它。
- **面板底座功能（MVP）**：
  - 打开/关闭：`ctx.layout.openDetails() / closeDetails()`；开关按钮挂到官方 `sidebar.footer.action`（加性 list slot，官方左侧栏底部）——干净的入口，不占屏。
  - 拖拽调宽：直接复用 AppFrame 内置的 details 拖拽把手，宽度夹在官方契约 300–520px，不越界。
  - 宽度持久化：自己的 entry store（`createXXXStore()` 工厂，遵循四 shares 规范），localStorage 持久化宽度偏好，启动时恢复并 `openDetails()`。
  - Tab 条：默认一个「详情」tab 内嵌官方工具详情座位；同时声明**公开的 tab 注册槽**（如 `rightbar.tab`，list/keyed、scope: session），第三方插件用 `ctx.slots.inject('rightbar.tab', ...)` 注册自己的 tab（id / order / label / 图标 + 组件），tab 条自动从 slot ledger 渲染 —— 机制对齐官方 `conversation.view`（`ui-conversation/src/client/contract/slots.ts` L113，id/order/label）。
  - 主题/文案：`--dsw-*` tokens + CSS Modules，中文产品文案，locale 声明。
- **数据流**：严格四 shares（PropsRuntime & PropsRenderSlots & PropsStore & inject face），组件零 `ctx`，符合 `packages/client/AGENTS.md`。

## 3.5 会话联动基础（已对照 DSH 源码核实）

**结论：基础是有的，而且官方就是按「会话联动 UI」设计的；只有一个跨包读官方选中态的红线要绕开。**

已核实的官方机制：

| 机制 | 位置 / 证据 | 用处 |
|---|---|---|
| 会话级 slot（scope: `'session'`） | `details`、`conversation.chat.node` 等；`packages/client/ui-layout/src/client/index.ts` | 每个 session 一个面板实例，`sessionId` 是框架注入的标准 prop |
| 框架 hooks（订阅通道） | `useSession`（实时快照：frames / 工具调用 / cwd / 状态）、`useSessions`、`useWorkspaces`、`useStore`、`renderSlot` | 侧边栏渲染跟随当前会话的实时数据，无需自己接事件 |
| 会话级 store（共享 store handle） | `packages/client/ui-conversation/src/client/apply.ts` L381–457：ChatView 与 DetailsPanel 共享 `chatStore` | 官方「点工具行 → 右侧详情」的联动样板，同一包内多注册共享 |
| 跨包动作服务 | `ctx.conversation`（send / cancel / loadOlder / updateQueue）与 `ctx.conversation.input`（`insertReference` / `setDraft` / `submit` / `notify`，`ui-conversation/src/client/service.ts`） | 侧边栏点击 → 往当前会话输入框插 `@引用` 或提交，是现成钩子 |
| 工作区服务 | `workspaces.openPath(...)`（`ui-conversation/src/client/apply.ts` L401） | 侧边栏点文件 → 在工作区打开 |
| Conversation Node 系统 | `conversation.chat.node`（keyed, scope: session）；`docs/cookbook/adding-a-conversation-node.md` | 插件可在消息流内渲染自己的节点，与自己的面板共享同一个 store → 「消息流 ↔ 面板」双向联动 |

**红线（真实缺口）**：官方「当前选中了哪个工具调用」存在 ui-conversation 私有的 `chatStore` 里；跨包直接读被 bundle purity 规则禁止（唯一通道是 slot 系统 + ctx 服务）。也没有现成的「滚动/高亮到某条消息」的跨包 API。

**对策（零官方代码改动）**：我们的插件 = 一个包、多个注册、共享**自己的**会话级 store：
- 面板注册进 `details`（详情 tab）+ 自己的 conversation node（消息流内渲染联动控件）+ 可选 composer 集成；
- 双向点击都在我们自己的 store 上完成，动作走 `ctx.conversation` / `ctx.conversation.input` / `workspaces.openPath`。

由此分出两条干净路径（见「待拍板 D」）：
- **路径 1（列内接管）**：接管 `details` 列。视觉最干净，但官方 ChatView 工具行的点击不再驱动我们的详情 tab（官方选中态跨包不可读）——需要我们自己渲染联动节点来补回这个方向。
- **路径 2（叠加共存）**：官方 `details` 保留不动，我们的面板走 `shell.overlay`。零冲突，官方联动全保留；我们通过 hooks + conversation/input 服务做自己的联动。代价：是浮层面板而不是真正的列。

**已拍板：路径 1 —— 真列（details 接管）。**

## 3.6 联动服务层（面向未来插件，已拍板路径的必然延伸）

未来插件要做的三类操作（跳转到第几条消息 / 消息折叠展开 / 改变主界面显示的 session 内容）本质是**同一件事：会话级「视图状态」被两侧共同订阅**。我们不需要为每类操作单开机制，而是做一个**会话级联动层**：

- **状态**：我们的插件声明一个自己的会话级 store（entry store，`createXXXStore()`），统一存：`revealTarget(seq)`、`folded` 集合、`activeView`、`selectedCall`。侧边栏与主界面两侧都从这一个 store 读、都往这一个 store 写 —— 同步天然成立。
- **主界面侧锚点**：官方 `conversation.view` 是 `list` 槽（scope: session，见 `ui-conversation/src/client/contract/slots.ts` L113），插件可以注册**自己的会话视图 tab**（官方 trajectory 就是先例）。我们的主界面侧 = 自己的 conversation view + 自己的 conversation node，DOM 完全可控 → 滚动到某条消息、折叠/展开由我们自己实现，不需要官方 API。官方 chat 视图保留为一个 tab，原样不动。
- **侧边栏侧锚点**：details 列接管（真列）。
- **给未来插件用的服务**：`ctx.reflect.provide` 暴露一个会话级服务（如 `ctx.sessionView`：`reveal(seq)` / `setFolded(id, folded)` / `setView(id)`），任何插件调用它 → 写进共享 store → 两侧同时响应。这就是「第三方插件控制主界面 + 侧边栏同步」的开放接口。
- **明确边界**：官方 ChatView 的滚动容器和折叠不在我们控制内，也不会有跨包 API 去驱动它；所以联动以「我们自己的视图/节点」为锚。若未来非要驱动官方 ChatView 本身，那需要给 ui-conversation 加最小扩展点（动官方代码，届时再评估，不在本方案默认范围内）。

## 4. 仓库结构（参考 dsh-warm-minimal）

```
dsh-right-sidebar/
  package.json            # name/version/dsh.bundle.patch -> ./cordis.patch.yml/files/engines
  cordis.patch.yml        # 一行 insert：bundle 层挂载本包
  src/                    # client 插件源码（apply / inject / Config + 组件 + store）
  lib/                    # 构建产物（lib/index.js + lib/client.js，tsdown）
  scripts/build.sh        # DSH_CHECKOUT 自动探测 + tsc + tsdown client
  scripts/setup.sh|ps1    # 一键装配（参考 warm-minimal，可选）
  README.md  LICENSE  THIRD_PARTY_NOTICES.md  .gitignore
```

- **开发/注入闭环**：`dev_scaffold_plugin`（ui-panel 骨架）→ 改成 details 接管实现 → `dev_build_plugin` → `dev_inject_plugin`（web profile）→ `dev_reload_package` 迭代 → 稳定后 `dev_release_plugin` 发 pre-release。全程不动 DSH 源码，随时可卸载。

## 5. 里程碑

| 阶段 | 内容 | 出口 |
|---|---|---|
| M0 | 骨架 + details 接管最小实现（详情 tab + 开关 + 拖拽 + 宽度持久化） | 注入 web profile 可用 |
| M0.5 | **联动层**：会话级 store（revealTarget / folded / activeView / selectedCall）+ `ctx.sessionView` 服务 + 自己的 conversation view/node 骨架（滚动到消息、折叠展开的最小闭环） | 两侧同步演示可用 |
| M0.7 | **Tab 开放接入**：声明 `rightbar.tab` 注册槽 + 示例 tab（验证注册 / 激活 / HMR / 卸载） | 第三方插件可接入 |
| M4 | 发布 pre-release（GitHub Release v0.1.0） | 发布 |

> 已取消：文件 / Git / 终端 tab（原 M1–M3）—— 不做内置功能，交给插件生态。

## 6. 风险与决策点

- **R1（需 spike）**：single-slot 替换语义 + 激活顺序要在真实 web 环境实测（热重载/HMR 下是否稳定；DSH 升级后 `conversation.details.tool` 座位名是否变化，需适配点）。
- **R2（设计取舍）**：宽度上限 520px 是官方列契约；「强大」若要更宽只能走 overlay hack。决策：MVP 坚持 520 以内（干净），v2 再考虑可选「宽屏模式」。
- **R3（占用 vs 加性）**：接管 `details` 列 = 替换官方 DetailsPanel（虽保住其座位），属于「占用官方座位」而非「加性挂载」。若不可接受，退回 `shell.overlay` 浮层方案 —— 但那正是现有插件的老路，不推荐。**已拍板：接受占用，走真列。**
- **R4（联动边界）**：官方 ChatView 的滚动/折叠没有跨包 API；联动以我们自己的 view/node 为锚（§3.6）。若未来要驱动官方 ChatView 本体，需要动官方代码，届时单独评估。

## 7. 待拍板

- A. 挂载方案：**details 接管（已拍板）** vs `shell.overlay` 浮层？
- D. 会话联动路径：**路径 1 真列（已拍板）** vs 路径 2 叠加共存？（见 §3.5 / §3.6）
- B. 仓库名：`dsh-right-sidebar`？（可改）
- C. MVP 验收标准：注入后能看到右侧栏、可开关/拖拽、刷新后宽度记住、官方工具详情仍在？
- E. tab 定位（**已拍板**）：**tab 开放接入、不内置文件/Git/终端**；底座默认仅「详情」tab（收编官方工具详情座位）。
