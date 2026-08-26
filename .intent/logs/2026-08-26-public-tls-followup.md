# Public TLS follow-up after restart

Record ID: `SRC-2026-08-26-RIGHT-SIDEBAR-PUBLIC-TLS-FOLLOWUP`

Status: Agent fact correction after the deployment record. It does not change sidebar intent or the local installation result.

The first post-restart check returned HTTP 200 from both `http://127.0.0.1:3082/` and `https://dsh.sch246.top/`. A later final check still found `dsh-web` active and the local application returning HTTP 200, but repeated requests from this host to the public HTTPS endpoint failed during TLS negotiation with `SSL_ERROR_SYSCALL`.

This does not retract the earlier successful observation, but it means continuous public reachability was not established. The application process and local HTTP service remain healthy. If the user's browser cannot reach the site, the public proxy/TLS path requires separate diagnosis; if it can, the failure is specific to this host/path or transient external routing.
