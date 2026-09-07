# Group-scoped native file receivers

The user requires chat file drops to belong to the central chat and each right-sidebar group to own an independent receiving range and events. Sidebar remains independent of file features. This candidate extends the grouped workbench from `7d0eb96`; it does not alter the Host patch, profiles or live service.

Plugin version `0.0.2` introduces the receiver API; consumers require `>=0.0.2 <1` independently of other feature versions.

The public `registerFileDropHandler(sessionId, instanceId, { canAccept?, drop })` receiver belongs to an existing feature instance. The runtime resolves its current group and active ready state at delivery. Registration disposers, authoritative close, renderer replacement, missing renderer/restorer and runtime disposal remove receivers. Session bindings reject stale delivery. Consumers own transfer policy, destination, progress, cancellation and detailed errors; rejected promises reach the existing sidebar operation error.

Native Files are captured only inside each rendered content rectangle. Tab bars, rails and unused sidebar regions cancel file navigation without dispatching a receiver. Native file delivery replaces the former pass-through to arbitrary editor DOM drop listeners. Text drops remain feature-owned, and the sidebar's internal MIME retains docking precedence even if a transfer also advertises Files. No document/window listener or feature dependency is added.

Validation in `/root/dsh-file-transfers/sidebar`:

- `DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh` passed; Node entry, browser declarations and browser bundle built in the candidate package.
- `DSH_CHECKOUT=/root/deepseek-harness pnpm test -- tests/workbench-api.client.spec.ts tests/right-sidebar.client.spec.tsx -t 'native files|native-file|frozen public API|captures internal content|internal tab-bar'` passed. The package wrapper forwarded a delimiter, so Vitest collected all four package files: 49 tests, 11.11 seconds. This is package evidence, not a Host suite run.
- `git diff --check` passed.
- The new cases exercise per-group delivery, mounted-session isolation, active-instance changes, move/close/switch/disposer lifetime, rejected callbacks, renderer loss, horizontal/vertical content isolation, tab-bar and unused-area navigation suppression, and internal drag precedence.

No profile install, service restart, push, browser automation or manual acceptance was performed. The reusable build, consumer registration and gesture verification route is recorded in STATE. Native browser drag behavior and file-manager uploads remain integration acceptance work.
