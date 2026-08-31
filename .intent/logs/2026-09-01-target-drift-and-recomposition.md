# Harness alpha.2 target drift and recomposition

Date: 2026-09-01

Status: Verified target drift and realization replacement. Sidebar semantics are unchanged.

The current recomposition target is the official DeepSeek Harness `dsh-v0.1.2-alpha.2` release commit `0a53fb55bea101816fa226bb964ae2bed71c343b`. The earlier official baseline `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` and candidate 9 bind an older target and state revision. They remain immutable implementation and lifecycle evidence, but they are not applicable installation instructions or a selected realization for alpha.2.

The target change does not revise the desired effects. The sidebar remains a default-hidden, full-height layout column with one navbar visibility action, availability before the first message, nonzero-width persistence, a visually quiet empty platform, and the stable `@dsh-external/dsh-right-sidebar/client` / `rightbar.tab` registration API. Earlier user confirmation of the C4/C5 shell and the repaired new-conversation interaction remains historical acceptance evidence for those behaviors; it does not establish that an alpha.2 realization is installed or accepted.

Source commits `622993b9f90eb5342bbae9fa952988798cfebc5b` and `513ff0f056fdcc8004e729904561cb1036adda40` are current, unsealed migration evidence. They adapt one implementation to Harness's split client packages, including Cordis context, renderer-owned slot registration, client-store ownership, and moved layout/store patch locations. Those coordinates, patch hunks, and commits describe one migration attempt only. They do not extend the stable API or constrain a future realization to the same Harness internals.

An Agent must inspect alpha.2 at the exact target commit, synthesize the smallest conforming implementation from current state, verify it, and seal new immutable source/target bindings and ownership evidence before selecting a realization. Candidate 9 remains unchanged as a frozen historical bundle. `SIDEBAR-005` two-way session-isolated synchronization and owned uninstall remain unaccepted.
