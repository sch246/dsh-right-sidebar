# Navbar control alignment refinement

Record ID: `SRC-2026-08-26-NAVBAR-CONTROL-ALIGNMENT`

Status: user visual acceptance of the prior chrome revision plus a new alignment refinement.

## User observation and decision

The user confirmed that C4's overlap removal, invisible full-edge resize target, single visibility control and quiet empty panel now match the intended effect.

The remaining refinement is that the sidebar visibility button should share the Session log button's vertical center. The user measured the current sidebar button as six pixels too high. Its standalone edge and shadow should also be removed.

## Checked geometry

The Session log control is 32 pixels high inside a header with 12 pixels of top padding, placing its center at 28 pixels. The global navbar starts at 8 pixels and the sidebar toggle is 28 pixels high, placing its center at 22 pixels. The measured difference is therefore exactly six pixels.

## Selected realization detail

Match the host control rather than applying an isolated six-pixel translation:

- make the sidebar toggle 32 by 32 pixels;
- place the global navbar at 12 pixels from the top;
- use a transparent, borderless, shadowless resting state;
- retain hover and focus-visible feedback.

This aligns both top edges and centers, preserves the measured navbar-clearance mechanism, and avoids encoding a corrective transform that would become wrong if the button height changes again.

## Evidence boundary

Source geometry and component checks can prove the intended dimensions and styling declarations. Final visual acceptance remains a live-browser observation.
