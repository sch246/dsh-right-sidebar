# Bounded acceptance evidence

[The bound deployment log](../../../logs/2026-09-05-grouped-workbench-deployment.md) records the commands, observed interactions, intermediate defects and their corrections. Focused repository checks passed: 28 sidebar tests, 75 viewer/editor tests and 36 manager tests, with TypeScript checks and owned builds. No full Host test-suite claim is made.

The private full-composition browser verified four-edge 10% docking, half-area overlays, center joins, tab ordering, exact document preservation, split/vertical-rail resizing, session retention and reload restoration. Resource checks covered text, image, memory sources, generic selectors, shared documents, preview lifecycle, dirty-close protection, safe automation and conflict pause. Manager checks covered polling, loaded-tree filtering, deletion/trash and guarded byte/text RPC. A separate normal cold page without the browser-only test hook loaded successfully. The fresh live page verified launcher → Files → existing README in an adjacent group without editing it.

`evidence.json` binds implementation and served artifact digests. Screenshots are local observations, not user visual acceptance. All private deletion operations targeted disposable fixtures; live browser verification was read-only with respect to user files.

This candidate is locally installed and activated. Acceptance remains incomplete because user visual review, grouped-workbench uninstall/drift rehearsal, and the pre-existing global Cordis API generator issue remain open. None is presented as solved by a digest, build, or successful boot.
