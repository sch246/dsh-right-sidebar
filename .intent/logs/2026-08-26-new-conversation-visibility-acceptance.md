# New-conversation visibility acceptance

Record ID: `SRC-2026-08-26-RIGHT-SIDEBAR-NEW-CONVERSATION-ACCEPTANCE`

Status: User runtime acceptance for the repaired interaction.

After the Agent rebuilt the right-sidebar and ui-layout artifacts, restarted `dsh-web`, and reported the local/public delivery boundary, the user tested the deployed interface and reported:

> 实际测试通过

This closes the reported mismatch: the right-sidebar can be opened from the ordinary new-conversation interface before the first message. It also demonstrates that the intended browser path reached the restarted deployment despite later TLS failures observed by curl from the server host.

This acceptance is scoped to the reported new-conversation visibility behavior. It does not close the independent two-way feature synchronization, target-drift maintenance or owned-uninstall acceptance criteria.
