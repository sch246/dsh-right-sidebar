# Agent-driven portability and API authority

Record ID: `SRC-2026-08-26-RIGHT-SIDEBAR-AGENT-DRIVEN-PORTABILITY`

Status: User architecture decision. It supersedes the earlier decision that dsh-std/adapter-dsh was the required long-term portability and Harness-mapping boundary. Earlier logs and frozen realization locks remain unchanged as historical evidence.

## User decision

The user established the following model:

> 就算要求侧栏功能跨宿主运行，现有rightbar本质上也是封装harness变成api供注册的
>
> 我认为意图包实际上覆盖了std面对的需求——意图本身是与实际实现解耦的
>
> 在这个视角上引入std是不必要的

The user then selected the operational consequence:

> 我认为应该接受安装、维护和迁移都由agent驱动，如果有实现阻力，那么解决方案应该是让state提供更好的安装指导
>
> 如果我们在意sidebar提供的api稳定，那么api设计应当进state
>
> 进行重构

## Revised model

Cross-host portability belongs first to intent. The same state can be realized against different hosts through different native APIs, generated adapters or host modifications. Those concrete APIs and mechanisms are realization details unless the user explicitly promotes an API design into state.

For this package, the sidebar registration API is user-relevant because other feature plugins must be able to depend on it. Its stable semantics therefore enter state. Harness slot names outside that public boundary, layout stores, patch hunks, build commands and installation mechanics remain lock-bound.

Installation, maintenance and migration are Agent-driven:

1. read current state and selected protocol;
2. inspect the target host and any applicable realization lock;
3. implement or adapt the state against current reality;
4. report feasibility tension before weakening state;
5. bind the resulting target version, owned effects, procedures and evidence in a realization lock;
6. maintain or uninstall by re-synthesizing the target while preserving unrelated effects.

Implementation difficulty is not a reason to introduce a second semantic authority or silently weaken the sidebar. When instructions or acceptance are insufficient, improve state or report a tension for user decision.

## Consequences

- dsh-std is not a required dependency, portability authority, migration target or acceptance condition for right-sidebar.
- Existing dsh-std experiments remain historical evidence of one possible realization and lifecycle design. They do not constrain the current implementation.
- The direct Harness implementation is not inherently transitional. It is one target-specific realization and may remain so while it satisfies state.
- A future host may use dsh-std, another adapter, a native extension point or generated source changes. Choosing among them belongs to that realization lock.
- Agentless binary interoperability through one shared ABI is not required. If it becomes a desired effect, that is a new state-level decision.

## Reopen condition

Reconsider a shared runtime standard only if the user explicitly requires installation or interoperability without Agent synthesis, or evidence shows that repeated target realizations are causing a user-visible cost that better state guidance and reusable lock resources cannot address.
