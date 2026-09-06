# Sidebar dependency intent

The September 6 user clarification distinguishes required services from optional feature integration. Sidebar depends on Host layout/slots/locale only. Viewer and manager are intended independent consumers; Links belongs to shared file access and needs no sidebar. The existing Links dependency remains an installation fact until its runtime is migrated.

This documentation-only candidate preserves the workspace migration, package identity, storage keys and independent version. STATE and agent navigation record the target without claiming a profile migration or activation. Validation covers local references and Git whitespace; historical locks remain unchanged.

## Installation-map correction

The user clarified that meta-intent addresses code debt and changing upstream/environment conditions through an executable installation and maintenance map. STATE supplies behavior, references and adaptation steps; feedback and real observations progressively refine it. A list of existing coupling or unfinished refactors belongs in evidence logs, not STATE. The preceding documentation commit incorrectly mixed these roles; this correction removes that progress layer from the map.

The concrete sidebar relocation remains a candidate, not an installed profile change. The installed Links implementation still injects sidebar/workbench/manager; that is implementation evidence, not a required feature relationship. The following earlier STATE observations are retained here for maintenance provenance:


- Whether DSH or this realization should own cleanup of the orphan `link:` symlink left after `dsh plugin remove`; manifest, lockfile, bundle configuration, and runtime dump are already clean at that point.
- The last recorded global Cordis API catalog attempt failed on the `chat/open-workspace-file` rendering-projection partition violation. Its current status is unverified; installation or maintenance requiring this generator must resolve any reproduced failure before claiming the complete catalog workflow.
- Target-drift maintenance and owned uninstall have not been exercised for a grouped-workbench realization.
