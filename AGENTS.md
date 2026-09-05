# Agent entry

This repository is a DeepSeek Harness plugin checkout with an embedded intent package at `.intent/`.

- Start with [.intent/state/STATE.json](.intent/state/STATE.json) and [STATE.md](.intent/state/STATE.md). State owns intent; this file provides navigation. The repository root remains the package root used by pnpm and `dsh plugin`.
- Use the [operation map](.intent/state/STATE.md#installation-maintenance-and-removal) for build, installation, maintenance and removal. It links the current scripts, Host prerequisites and known limits.
- Retrieve relevant logs or locks when checking provenance, ownership or target applicability. Protocol 0.2 is selected in STATE.json; historical locks are immutable evidence, and no lock is currently selected. Do not infer acceptance or live installation from a build or candidate lock.
- Inspect current consumers and ownership before removing shared Host support, including selective store persistence. Whole-patch reversal is not a consumer check.
- Apply Host patches, change live profiles, restart services and publish only within the authority granted for that action; reuse existing authorization. Routine authorized work does not require a new permission question or lock.
