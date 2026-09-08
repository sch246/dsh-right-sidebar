# Focus and navigation repair

User clarified that typing loses focus, not text. The panel effect focused the active tab whenever the target group changed, overriding a click into its editor. Removed that effect and the focus-outline tracking; tab keyboard navigation focuses its target explicitly. History capture now lives on the common workspace ancestor because tab chrome and content surfaces are siblings. Header history buttons are removed.

No tests or browser automation were run, following the user request. Build and activation evidence belongs in the local maintenance receipt.
