# Security Guide

STEM Agent ships with a conservative default posture: authentication and
rate limiting are off until configured, CORS is open, and the new hardening
middleware (helmet-style headers, audit log) is opt-in. This keeps the
quickstart working out of the box but requires explicit hardening before
production.

This guide documents the current controls, what's opt-in, and the follow-up
work not yet shipped.

## Threat model (lite)

| Asset | Threat | Control |
|-------|--------|---------|
| LLM provider credentials | Exfiltration via logs or errors | pino redaction (default on), `LOG_REDACT` configurable |
| Caller profiles / episodic memory | Unauthorized read / GDPR violation | Auth required for `/api/v1/agent/profile/:id`; `forget-me` API |
| Tool call authorization | Privilege escalation (caller invokes restricted tool) | `toolAllowlist` on DomainPersona; `requirePermission` on admin routes |
| Rate-limit bypass | Cost blowout via scraping | In-memory rate limiter; **per-pod only** (see `docs/deployment.md`) |
| Replay / CSRF | State changes against authenticated user | Token-based auth (no cookies); origin-locked CORS in prod |
| Header injection / clickjacking | Cross-origin embedding, MIME confusion | `securityHeadersMiddleware` (opt-in) |
| Audit gaps | Post-incident investigation blocked | `auditLogMiddleware` (opt-in) → SIEM pipeline |

## Authentication

Three providers ship today (see `packages/standard-interface/src/auth/`):

| Provider | Credential | Notes |
|----------|-----------|-------|
| API Key | `X-API-Key: …` header | Static principal map in config — good for service-to-service |
| JWT (HS256) | `Authorization: Bearer …` | Shared-secret symmetric only; validates `iss`, `aud`, `exp` |
| OAuth 2.0 | `Authorization: Bearer …` | Token introspection via POST to the auth server |

Enable auth via `GatewayConfig.auth.enabled = true`. See
`docs/getting_started.md §6` for example curl calls.

**Not yet implemented** (documented as placeholders in the `AuthProtocol`
enum): SAML, mTLS, RS256/ES256 JWT with JWKS rotation. Contributions welcome.

## Authorization

`Principal.permissions: string[]` has been on the type since v0.1, but until
now nothing consumed it. New helpers live in `src/auth/authorize.ts`:

```ts
import { requirePermission, requireAnyPermission } from "@stem-agent/standard-interface";

router.post(
  "/admin/mcp/reload",
  requirePermission("mcp:reload"),
  async (req, res) => { /* ... */ },
);
```

Behavior:
- 401 if no `req.principal` (auth didn't run or anonymous).
- 403 if the principal lacks the permission.
- Errors flow through the standard `errorHandler`, so responses match existing
  shape (`{error: {...}}`).

Mix with `requireAnyPermission("admin:*", "operator:read")` for
multi-role endpoints.

## Transport security

| Control | Status | Enable |
|---------|--------|--------|
| TLS | Handle at ingress (nginx / ALB / Istio) — no in-process TLS | cluster-level |
| Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | **Opt-in** | `SECURITY_HELMET=true` or `GatewayConfig.securityHeaders = true` |
| CORS | Wide-open (`*`) by default; startup warn when unset | Set `GatewayConfig.corsOrigin = "https://your-app.example.com"` |
| `X-Powered-By` leak | Removed when security headers enabled | via `SECURITY_HELMET=true` |

The hand-rolled headers module (`src/middleware/security-headers.ts`) defaults
to a JSON-API-safe CSP (`default-src 'none'`) — if you serve a browser
dashboard, override `contentSecurityPolicy` to allow your own assets:

```ts
new Gateway(agent, {
  securityHeaders: {
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'sha256-...'",
  },
});
```

## Audit logging

When `AUDIT_LOG_ENABLED=true`, a pino child logger (`name: "audit"`) emits
one JSON event per request after `res.finish`:

```json
{
  "ts":        "2026-05-04T22:00:00.000Z",
  "requestId": "...",
  "principal": { "id": "user-42", "type": "user" },
  "action":    "POST /api/v1/chat",
  "resource":  "/api/v1/chat",
  "decision":  "allow",
  "status":    200,
  "latencyMs": 412,
  "ip":        "10.0.1.7"
}
```

**SIEM integration**: events go to stderr alongside other logs. Downstream:

```text
stem-agent → stderr → fluent-bit (filter: name == "audit") → S3 / Splunk / OpenSearch
```

Because audit events share the `name` field with pino's root logger
discriminator, any log shipper can fork the audit stream into its own index.

**What's NOT audited** (by design — add as needed):
- WebSocket frames (per-message; too noisy for a generic audit log).
- MCP tool calls (audited inside agent-core; emit your own if tighter grain
  is required).
- Memory reads (caller profile reads *are* audited as HTTP calls; direct
  library use bypasses the audit log).

## Log redaction

`createLogger` in `shared/src/logger.ts` now applies pino's `redact` config
with a safe default path list:

```
req.headers.authorization
req.headers.cookie
req.headers["x-api-key"]
*.password, *.apiKey, *.api_key, *.token, *.secret, *.ssn
```

This is safe to enable by default because pino only redacts paths that
actually appear. Override via `LOG_REDACT=comma,separated,paths` or disable
with `LOG_REDACT=off`.

## Rate limiting

See `src/middleware/rate-limit.ts`. Token-bucket keyed by `principal.id ?? req.ip`.
**In-memory only** — a Redis-backed limiter is documented as follow-up work
in `docs/deployment.md §Scaling caveats`. For production with replicas > 1,
either pin clients via sticky sessions or accept per-pod quotas.

## Control matrix

| Control | Default | Env | Config |
|---------|---------|-----|--------|
| Auth | disabled | — | `GatewayConfig.auth.enabled` |
| Authorization | per-route, off | — | `requirePermission(...)` per route |
| Security headers | disabled | `SECURITY_HELMET=true` | `GatewayConfig.securityHeaders` |
| Audit log | disabled | `AUDIT_LOG_ENABLED=true` | `GatewayConfig.auditLog` |
| Log redaction | **enabled** (safe default) | `LOG_REDACT=off` to disable | — |
| CORS | `*` (with warn) | — | `GatewayConfig.corsOrigin` |
| Rate limit | disabled | — | `GatewayConfig.rateLimit` |

## Follow-ups (not shipped)

- RS256 / ES256 JWT with JWKS rotation.
- SAML provider.
- mTLS provider (requires holding TLS termination in-process or wiring a
  client-cert header from the ingress).
- Redis-backed rate limiter.
- Per-tool authorization (extend `toolAllowlist` with permission-bound rules).
- Secret scanning in CI.
