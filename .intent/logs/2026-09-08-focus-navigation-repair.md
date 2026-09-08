# Focus and navigation repair

User clarified that typing loses focus, not text. The panel effect focused the active tab whenever the target group changed, overriding a click into its editor. Removed that effect and the focus-outline tracking; tab keyboard navigation focuses its target explicitly. History capture now lives on the common workspace ancestor because tab chrome and content surfaces are siblings. Header history buttons are removed.

No tests or browser automation were run, following the user request. Build and activation evidence belongs in the local maintenance receipt.

Follow-up: history commands explicitly focus stable group chrome before replay. The same DOM target survives tab and resource replacement, including failed or exhausted history operations; subsequent Alt+arrow events stay within the sidebar capture path.

Follow-up from user reproduction: clicking an editor breadcrumb into a directory, then Alt+Left, can reach browser history because ordinary instance activation did not transfer focus from the hidden editor. A layout effect now hands sidebar-owned focus to stable destination group chrome only when the active destination changes. Focus already in destination content or outside the sidebar is preserved; refs track outgoing focus without visual focus state. No browser automation or tests were run.
