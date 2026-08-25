# Product-quality scope and adapter direction

Record ID: `SRC-2026-08-25-PRODUCT-QUALITY-AND-ADAPTER-DIRECTION`

Status: user authority plus bounded repository investigation. It revises sidebar intent and the preferred responsibility boundary; it does not accept the current realization.

## User decisions

The user requires the right-sidebar platform to be made as complete as practical within its scope, including product-quality UX and interaction design. “No business feature” limits the platform's subject matter; it does not authorize a skeletal registration API, provisional interaction, or unpolished shell.

Long-lived modification of official DeepSeek Harness source is explicitly allowed. Upstream breakage is expected to be handled by an Agent rather than avoided by weakening the desired effect.

A lock pins one concrete implementation version and behaves as a cache. It is not required to close or reproduce the whole build environment. State must remain sufficient for an Agent to produce another acceptable implementation when the selected cache cannot be used, without promising implementation identity.

The Harness-facing realization may live in the `dsh-std` adapter and be maintained by its own intent package. When DeepSeek Harness changes, that adapter realization and lock can be regenerated while portable sidebar consumers remain unchanged when their surface contract still holds.

## Checked adapter facts

At public `Yan-Zero/dsh-std` commit `bb194ad53a72f4fa7da1286c88dcebb488b43eb9`, `@dsh-std/adapter-dsh` is explicitly responsible for mapping standard protocols and UI contributions onto DeepSeek Harness, absorbing upstream product changes, recording activation ownership, and retracting registrations on disposal. It currently maps settings and tool-call UI surfaces but does not define or map the required right-sidebar surface.

## Consequences for this package

- Tab registration, lifecycle, two-way session-scoped coordination, accessibility and interaction quality are first-class platform behavior, not optional future examples.
- The platform still contributes no review, terminal, browser, file, Git or other business tab.
- Direct Harness patching in candidate C1 remains useful implementation evidence but is a transitional mapping, not the desired long-term ownership boundary.
- The target architecture has one Harness-internal owner: `dsh-std/adapter-dsh`. Portable sidebar components depend on a surface contract and do not import Harness internals.
- The transition completes only after a real external component exercises the portable surface through the adapter and the direct sidebar-owned Harness patch can be removed.
