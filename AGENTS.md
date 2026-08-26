# Agent entry

This repository is both a DeepSeek Harness plugin checkout and the host of an embedded intent package.

- Intent-package root: `.intent/`.
- Read `.intent/state/STATE.json` and its selected protocol before changing, installing, maintaining, or uninstalling the plugin.
- The repository root remains the DSH package root consumed by pnpm and `dsh plugin`.
- `AGENTS.md` is a bootstrap pointer, not semantic authority. If it conflicts with `.intent/state/`, state wins; a selected realization lock supplies concrete target bindings and procedures.
- Check `candidateLocks` and `activeLocks` before making lifecycle claims. Do not describe a candidate as reproducibly installed or accepted merely because it builds or runs.
- If no current lock applies, follow the Agent-driven realization lifecycle in state: inspect the target, synthesize the smallest conforming implementation, then seal its immutable source/target bindings and ownership evidence. Historical locks are evidence, not install instructions for the current state.

Local development installation, after checking the target, any applicable lock, and granted permissions:

```bash
DSH_CHECKOUT=/root/deepseek-harness bash scripts/build.sh
dsh plugin --profile web add /root/dsh-right-sidebar
dsh --profile web --dump-config
```

Restarting `dsh-web`, applying `patches/deepseek-harness.patch`, publishing, or changing external Git state requires explicit authority for that action.
