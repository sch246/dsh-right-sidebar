# Candidate 8 lifecycle

Realization: `right-sidebar-linux-web-0.3.0-candidate.8`

Implementation identity: `dsh-right-sidebar` commit `e7821d1876096aeee80c952bb4c907774ff9ba1a`.

Install:

```bash
cd /root/dsh-right-sidebar
DSH_CHECKOUT=/root/deepseek-harness bash scripts/setup.sh
systemctl restart dsh-web
```

Uninstall:

```bash
cd /root/dsh-right-sidebar
DSH_CHECKOUT=/root/deepseek-harness bash scripts/uninstall.sh
systemctl restart dsh-web
```

Setup accepts only the exact forward or reverse patch state, verifies representative nearby package locators, records the exact patch digest and ownership in the Harness Git-private receipt, and regenerates shared client catalogs from all current source contributions. The ordinary purpose comments help an Agent investigate; they do not authorize reversal. Uninstall reverses Host source only when the same setup actually owned the exact patch and its reverse still applies, then regenerates catalogs so other packages' entries remain. Restart remains an explicit external action; it was not performed while sealing this candidate.
