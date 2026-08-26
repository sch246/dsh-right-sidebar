# Source-region ownership practice

Date: 2026-08-26

## Tension

The Harness realization modifies official source files, while package-level patch ownership alone does not tell an unfamiliar Agent which nearby code exists for this package or how removal should interact with another plugin touching the same generated surface.

## Observation

- The semantic Host regions are `dsh.store.partial-persistence`, `shell.navbar.action`, and `shell.details.transient-visibility`.
- `slot-catalog.ts` and `api-catalog.ts` are generated aggregations. Another installed package may contribute a different source slot while both entries appear in the same generated file.
- Treating either catalog as an exclusively owned patch path would make exact reverse application erase or conflict with the other package's contribution.

## Decision projected into state

- Every logical Host intervention carries a nearby native `@meta-intent:begin` / `@meta-intent:end` region marker naming this package and candidate realization.
- The patch owns source regions and their acceptance evidence, not the generated catalogs.
- Setup verifies representative markers and records patch digest, region ids, target head, marker schema, and source-to-generated mapping in a Git-private receipt.
- Setup and owned uninstall regenerate both shared catalogs from all source contributions that remain after the operation.
- Marker evidence does not authorize removal by itself. Exact patch provenance and reverse applicability remain required.

## Candidate boundary

This practice prepares `right-sidebar-linux-web-0.3.0-candidate.7` against Harness `b642a10626a950cc95c2d6f839810cb01fe599fe`. It is candidate evidence, not adoption or complete lifecycle acceptance. No live profile change or service restart occurred while preparing it.
