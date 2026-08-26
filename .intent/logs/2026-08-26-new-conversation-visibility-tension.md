# New-conversation visibility tension

Record ID: `SRC-2026-08-26-RIGHT-SIDEBAR-NEW-CONVERSATION-VISIBILITY`

Status: User-reported implementation mismatch, Agent reproduction and state clarification. Code changes must follow this record and the updated state.

## User observation

The user reported:

> 右侧边栏好像在新会话的界面点不开，得说第一句话才能点开是怎么回事

After the cause was explained, the user corrected the required information flow:

> 按流程应该经过log-state然后才是代码

The complaint establishes that the ordinary new-conversation interface is expected to honor the global sidebar visibility control before the first message is sent. Whether the host internally represents that interface as no current session or a blank session is not user-visible semantics.

## Facts checked

- The sidebar navbar action is root-scoped and already renders on the new-conversation interface.
- Clicking it calls the authoritative layout `openDetails()` action, which sets `detailsOpen` to true.
- Harness `AppFrame` currently derives a usable details session only when the current session exists and `blank === false`.
- The rendered details width is forced to zero whenever that derived session is absent, even when `detailsOpen` is true.
- Existing layout tests reproduce the hidden state: a blank session can retain `detailsOpen: true` while rendering a zero-width details column; changing it to non-blank then reveals the column.

## Tension

The current implementation inherited an official tool-details assumption: a details column is only useful after conversation content exists. The right-sidebar intent changed that column into an application platform with a root-scoped visibility control. Keeping the old blank-session gate makes the visible control lie about its effect and makes availability depend on sending content unrelated to the sidebar feature.

## State consequence

The global visibility action must open and close the right-sidebar on the ordinary new-conversation interface before the first message. A conforming realization must not preserve a hidden `open` state while rendering the control as closed. Host-specific session gating may remain only if it does not violate that observable behavior.

This log does not select a particular source expression. The target realization may remove, relocate or specialize the old gate as long as existing session-switch safety, default-hidden startup and width persistence continue to satisfy state.
