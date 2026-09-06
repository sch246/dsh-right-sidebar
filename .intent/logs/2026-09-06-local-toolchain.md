# Local toolchain and explicit lifecycle entries

The user requests consistent workspace structure and tools without equal plugin versions. Sidebar uses local TypeScript 5.9.3, tsdown 0.22.14 and Vitest 4.1.8. Its build links only necessary Host package declarations and no longer replaces compiler, test, React or type dependencies from the Host. A normal pnpm install produced the workspace lockfile; resolved tools point to this candidate's own .pnpm directories.

Setup/uninstall now require explicit checkout/Home/profile, inspect by default and mutate only under their explicit mode. They use the selected checkout CLI and preserve errors. Removal checks declared package consumers before Host reversal. Shared source consumers without a package dependency still require the ownership inspection described in STATE.

Executed local dependency install, candidate build with pinned tools, shell syntax and focused entry checks. No profile installation, source patching of the live Host, service restart or publication occurred. The candidate Harness was separately prepared with the unchanged sidebar patch and only skill-manager's shared generator hunks; those applications are integration prerequisites, not new ownership claims.

The isolated Host had no prebuilt store/primitives bundles. The test config now resolves those Host imports to source, requires the explicit checkout, selects automatic JSX and deduplicates React. After fixing those source-test prerequisites, all four files and 44 existing tests passed with local Vitest 4.1.8 and Vite 7.3.6. Local typecheck and build passed. The removal guard rejected the live profile's declared manager consumer during a read-only check; setup inspection accepted the prepared candidate Host without creating a profile.
