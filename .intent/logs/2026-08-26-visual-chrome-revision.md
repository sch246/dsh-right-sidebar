# Visual chrome revision after live inspection

Record ID: `SRC-2026-08-26-VISUAL-CHROME-REVISION`

Status: user intent revision plus checked implementation facts. This record changes the current visual and interaction authority; it is not final browser acceptance.

## User feedback and decision

After inspecting the live installation, the user rejected four visible effects:

- the global right-sidebar toggle overlaps the Session log action;
- the centered pill on the divider is unnecessary because the whole divider edge is already draggable;
- the panel-internal collapse action duplicates the global right-side toggle and should be removed;
- the visible `侧边栏` heading and `尚未注册侧栏标签页` empty-state row are self-evident or unhelpful chrome and should be removed.

The retained intent is one global open/close control, a full-height draggable divider without a separate visible grip, and a quiet empty platform that only introduces tab chrome when tabs actually exist.

## Checked facts

- The Session log action renders in `conversation.session.header.utilities` while the global sidebar toggle renders in the frame-level `shell.navbar.action` container. The latter is absolutely positioned at the frame's upper-right corner, so a closed details column gives it no flow-space and permits overlap with the session utility row.
- The divider's actual pointer target is already an empty, full-height, eight-pixel strip. The visible centered pill is only a CSS `::after` decoration; removing it does not remove pointer capture or resize behavior.
- The internal collapse button, visible title, tab strip and empty message are all owned by `RightSidebarPanel`. The external navbar toggle already calls the authoritative layout open/close actions.

## Implementation boundary

The overlap fix should reserve the measured global-navbar width in the session header while the details column is closed, rather than hard-coding the current Session log button width. This preserves separation between global layout actions and per-session utilities while letting both participate in one visible header row without collision.

Removing the decorative grip must retain the full-height hit strip and its existing pointer behavior. Removing empty chrome must not remove loading, failure, retry, tab selection or keyboard behavior once a contribution exists.

## Evidence boundary

The supplied screenshots and source inspection establish the current defects and their ownership. Browser-level acceptance still requires observing the rebuilt live surface after installation.
