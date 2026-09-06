# Sidebar dependency intent

The September 6 user clarification distinguishes required services from optional feature integration. Sidebar depends on Host layout/slots/locale only. Viewer and manager are intended independent consumers; Links belongs to shared file access and needs no sidebar. The existing Links dependency remains an installation fact until its runtime is migrated.

This documentation-only candidate preserves the workspace migration, package identity, storage keys and independent version. STATE and agent navigation record the target without claiming a profile migration or activation. Validation covers local references and Git whitespace; historical locks remain unchanged.
