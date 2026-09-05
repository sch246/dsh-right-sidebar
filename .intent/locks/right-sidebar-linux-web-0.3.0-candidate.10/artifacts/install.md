# Candidate 10 local installation

The local Web profile already resolves `@dsh-external/dsh-right-sidebar` through `link:/root/dsh-right-sidebar`; Bundle membership did not change. Installation replaced only the prior right-sidebar patch with the candidate patch, rebuilt affected Host and Web artifacts, rebuilt the linked plugin, and restarted `dsh-web`.

The receipt at the Harness Git path `dsh-right-sidebar.patch-state` binds patch SHA-256 `6a938dca4247ba4aa86c3d8ed1db9316f6e96f7eb572d6f320a33fd89e7254da`, Host commit `0a53fb55bea101816fa226bb964ae2bed71c343b`, source-region marker schema `meta-intent-source-region/0.1`, and the maximized-layout and unbounded-normal-width regions. It records the regenerated client slot catalog and the deferred Cordis API catalog separately.

Future maintenance starts by comparing the current target and receipt with this candidate. A matching owned patch may be reversed before applying a recomposed patch; drift requires investigation instead of forced application. The patch is a plugin-owned local adaptation and conveys no authority to modify or publish DeepSeek Harness upstream.
