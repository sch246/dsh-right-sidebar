<!-- meta-intent:entry:start -->
## Intent-package entry

Maintain an executable installation and maintenance map as user understanding, upstream software and environments change. The first map can be incomplete; use user feedback and checked reality to improve it, rather than making accumulated implementation debt the permanent design.

- Start with [this package's STATE](.intent/state/STATE.md) and the user's request. STATE tells an unfamiliar Agent which effects to provide, why they matter, where to find resources, and how to install, adapt, verify and remove them under applicable conditions. Keep every supported capability reachable from that map.
- Before writing, distinguish the information's role. STATE owns intended effects and reusable operational guidance. LOG owns selected actual decisions, observations and their reasons; historical implementation gaps, debt inventories and task progress belong there or in a disposable work record. Keep conditions and adaptation steps needed to act in STATE, without turning it into a status table. LOCK retains an exact purpose-bound realization, not permanent requirements. Do not turn this distinction into a mandatory document transaction for each repair.
- Inspect the target and recover relevant existing decisions before inferring new requirements. Code, tests and past installations are evidence about implementations; they do not decide user intent. Optional cooperation does not establish a required dependency. Change STATE when feedback clarifies an effect or experience improves the executable route, not merely because current code differs.
- Act within the user's existing authority. Read selected sources when why, scope or attribution matters; do not replay every LOG. Choose checks that resolve a real uncertainty at reasonable cost, and distinguish observed results from unperformed checks.
- This entry routes attention; it does not replace STATE or the selected protocol. Follow the package's state record for protocol/binding changes. See [meta-intent's map](../meta-intent/state/STATE.md) when maintaining this guidance or when the roles themselves are unclear.
<!-- meta-intent:entry:end -->

# Agent entry

This repository is a DeepSeek Harness plugin checkout with an embedded intent package at `.intent/`.

- Start with [.intent/state/STATE.json](.intent/state/STATE.json) and [STATE.md](.intent/state/STATE.md). State owns intent; this file provides navigation. The repository root owns the pnpm workspace and operation scripts; `packages/dsh-right-sidebar/` is the sole plugin package root used by `dsh plugin`. Source, tests, manifests, the Host patch and build output belong to that package; root development dependencies provide pinned local TypeScript, tsdown and Vitest for every plugin command; DSH_CHECKOUT selects only Host source/declarations.
- Use the [operation map](.intent/state/STATE.md#installation-maintenance-and-removal) for build, installation, maintenance and removal. It links the current scripts, Host prerequisites and known limits.
- Retrieve relevant logs or locks when checking provenance, ownership or target applicability. Protocol 0.2 is selected in STATE.json; historical locks are immutable evidence, and no lock is currently selected. Do not infer acceptance or live installation from a build or candidate lock.
- Inspect current consumers and ownership before removing shared Host support, including selective store persistence. Whole-patch reversal is not a consumer check.
- Sidebar has no file-feature dependency. STATE supplies executable installation and maintenance guidance; record current coupling, unfinished work and execution evidence in LOG, then refine the map from user feedback and observed facts.
- Apply Host patches, change live profiles, restart services and publish only within the authority granted for that action; reuse existing authorization. Routine authorized work does not require a new permission question or lock.
