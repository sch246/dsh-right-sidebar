# User intent: right-sidebar platform and embedded package

Record ID: `SRC-2026-08-25-RIGHT-SIDEBAR-INTENT`

Status: selective user-authority record. It captures the currently explicit outcome and package-placement decisions without treating unreviewed implementation details as approved.

## Desired outcome

The user requested a useful right-sidebar foundation for DeepSeek Harness without built-in business functionality. The sidebar should occupy full application height, participate in horizontal layout, support resizing with remembered width, start hidden, expose navbar and internal collapse controls, accept additional registered tabs, and allow a feature's main-view and sidebar contributions to share session state and actions.

The plugin should load from its Git checkout using the same general `link:` model as `dsh-warm-minimal`. Any necessary modifications to official Harness source should be tracked with the plugin repository so an Agent can investigate and reconcile them after upstream changes.

## Embedded intent-package decision

The user decided that the DSH package root may retain its standard plugin layout while an embedded intent package lives at `.intent/`. A root `AGENTS.md` is required to give an Agent the brief installation and discovery entrypoint.

The user also established that a realization lock may reference implementation and target resources instead of copying every byte into its bundle. Whether a mutable Git repository reference must always bind an exact commit hash remains an open design question; the user asked to record the package now rather than silently resolve that question.

## Authority boundary

The existing source, proposal, tests, and running behavior are implementation evidence. They may suggest acceptance checks or tensions, but do not make their unconfirmed details user intent.
