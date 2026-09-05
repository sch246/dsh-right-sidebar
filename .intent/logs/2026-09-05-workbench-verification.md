# Workbench verification and Host ownership

The multi-instance implementation has 24 passing focused tests. The candidate alpha.2 AppFrame suite has 29 passing tests, including session changes retaining open, ordinary width and maximization preferences. The shell no longer closes details on a session change. It projects measured navbar width for the tab row; the panel aligns its 56px first row with fixed controls and scrolls labels separately. Activating an existing instance through the public service also reveals a closed sidebar.

The owned Host patch was recomposed using an isolated Git index: reverse the previous exact patch from current governed files, then compare with the candidate governed files. Only AppFrame and its session-retention expectation changed from the previous owned patch; unrelated Host modifications are excluded. The new patch reverses cleanly from the candidate. No upstream Harness commit is created.

The private Home reproduces the live package set with candidate sidebar, generic viewer/editor and file-manager packages. Cold Web loading and filesystem-editor interaction provide integration evidence; deployment and final acceptance evidence belong in the next realization lock. Historical locks remain immutable and unselected.
