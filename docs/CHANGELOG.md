# Changelog

All notable changes to the `stem-agent` monorepo are recorded here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project adheres to [Semantic Versioning](https://semver.org/). All eight
workspaces (`stem-agent` root, `@stem-agent/shared`, `@stem-agent/agent-core`,
`@stem-agent/caller-layer`, `@stem-agent/mcp-integration`,
`@stem-agent/mcp-server`, `@stem-agent/memory-system`,
`@stem-agent/standard-interface`) are versioned in lockstep.

---

## [0.1.2] — 2026-05-05

Enterprise readiness release. Ships **industry personas**, **deployment
artifacts**, **security hardening**, and **observability** — all four
slices landed as illustrative, opt-in additions. Default runtime behavior
is unchanged: every new control is gated by an env var or config flag, and
the existing 0.1.1 test matrix continues to pass without modification.

### Added

#### Industry personas (Slice 1)

- **`domains/healthcare/`** — HIPAA-aware clinical decision support.
  - `persona.json`: forbids `direct patient diagnosis`, `PHI disclosure
    without authorization`, `unapproved off-label advice`. Required MCP
    servers: `fhir-mcp`, `pubmed-mcp`, `rxnorm-mcp`. Tool allowlist scoped
    to literature, drug interactions, and PHI-handling tools.
  - `skills.ts`: three committed skills — `phi_redaction_precheck` (runs
    before any external call), `literature_lookup`, `drug_interaction_check`.
- **`domains/legal/`** — Contract and compliance reviewer.
  - `persona.json`: forbids `issuing legal advice`,
    `privileged-communication disclosure`, cross-jurisdiction conclusions.
    MCP: `doc-store-mcp`, `case-law-mcp`.
  - `skills.ts`: `clause_extraction`, `risk_flagging`, `obligation_summary`.
- **`domains/ai-research/skills.ts`** — Filled the empty placeholder with
  three research skills: `paper_search_synthesis`, `benchmark_comparison`,
  `replication_assessment` (mirrors the finance / sre shape).

#### Deployment artifacts (Slice 2)

- **`Dockerfile`** (repo root) — multi-stage build.
  - Builder: installs full deps, runs `npm run build`, then
    `npm prune --omit=dev`.
  - Runtime: `node:22-slim`, non-root `node` user, `tini` as PID-1,
    `curl` for the `HEALTHCHECK` against `GET /api/v1/health`.
  - Fixes the pre-existing bug in `docker-compose.yml` where the `prod`
    profile referenced a Dockerfile that did not exist in the repo.
- **`.dockerignore`** — excludes `node_modules`, `dist`, `.env*`, docs,
  examples, and deploy manifests from the build context.
- **`docker-compose.prod.yml`** — production overlay demonstrating
  externalized `DATABASE_URL` / `REDIS_URL`, opt-in hardening envs, and
  resource limits. Standalone file (no `!reset` tags) for Compose v2
  portability.
- **`deploy/k8s/`** — illustrative Kubernetes manifests with
  `# example — adapt to your cluster` banners.
  - `deployment.yaml` — 2 replicas, resource requests/limits, readiness +
    liveness probes on `/api/v1/health`, non-root `securityContext`,
    `readOnlyRootFilesystem`.
  - `service.yaml`, `configmap.yaml`, `secret.example.yaml`, `hpa.yaml`
    (CPU-based HPA), plus a short `README.md` for the directory.
  - `prometheus.io/scrape` annotations wired so `/metrics` is discoverable
    once `METRICS_ENABLED=true`.
- **`docs/deployment.md`** — topology choices, build/push, `kubectl apply`
  flow, secrets management pointers (AWS Secrets Manager / Vault),
  `.env` tiering, and explicit **scaling caveats** (the rate limiter and
  AP2 mandate store are in-memory — documented as follow-ups for Redis
  backing).

#### Security hardening — all opt-in, default off (Slice 3)

- **`packages/standard-interface/src/auth/authorize.ts`** — RBAC middleware
  factories.
  - `requirePermission(perm)` — 401 when no principal, 403 when the
    principal lacks the permission, `next()` otherwise. Denials flow
    through the existing `errorHandler`.
  - `requireAnyPermission(...perms)` — same, short-circuits on any match.
  - Consumes `Principal.permissions` already defined in
    `shared/src/types/security.ts`.
- **`packages/standard-interface/src/middleware/security-headers.ts`** —
  hand-rolled security headers (no new dependency). Sets
  `Content-Security-Policy` (default: `default-src 'none';
  frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and
  `Strict-Transport-Security`. Removes `X-Powered-By`. Overrideable for
  browser-facing deployments. Gated by `SECURITY_HELMET=true`.
- **`packages/standard-interface/src/middleware/audit-log.ts`** — SIEM-ready
  audit stream.
  - Emits one structured event per request at `res.finish` via a pino
    child logger (`name: "audit"`).
  - Schema: `{ts, requestId, principal, action, resource, decision,
    status, latencyMs, ip}`. `decision = "deny"` for 401/403, `"allow"`
    otherwise.
  - Zero-overhead pass-through when disabled. Gated by
    `AUDIT_LOG_ENABLED=true`.
- **`shared/src/logger.ts`** — PII redaction by default.
  - New `DEFAULT_REDACT_PATHS` covers `authorization`, `cookie`,
    `x-api-key`, `password`, `apiKey`, `token`, `secret`, `ssn` (plus
    nested `req.headers.*` variants).
  - `resolveRedactPaths()` reads `LOG_REDACT`: unset → defaults,
    `off`/`false`/`0` → disabled, CSV → custom override.
  - Enabled by default; existing `createLogger` signature unchanged.
- **`packages/standard-interface/src/gateway.ts`** — opt-in middleware wired
  into the request chain:
  - `securityHeadersMiddleware` mounted early (before CORS/routes).
  - `auditLogMiddleware` mounted after `authMiddleware` so the
    principal is populated.
  - Startup `logger.warn` when `corsOrigin === "*"` — draws attention to
    the permissive default in production deploys.
- **`docs/security.md`** — threat-model-lite, auth-provider matrix,
  control-matrix table (per env flag), SIEM integration sketch
  (`stderr` → fluent-bit → S3/Splunk filtered on `name == "audit"`),
  documented follow-ups (SAML, mTLS, Redis-backed rate limiter).

#### Observability (Slice 4)

- **`packages/standard-interface/src/observability/telemetry.ts`** —
  dependency-free Prometheus text exposition.
  - Hand-rolled `Counter` and `Histogram` primitives (default histogram
    buckets `0.005 … 10s`).
  - Built-in metrics: `stem_agent_http_requests_total{method,route,status}`,
    `stem_agent_http_request_duration_seconds`,
    `stem_agent_http_errors_total`.
  - `initMetrics(app, config)` mounts `/metrics` and the measurement
    middleware when `METRICS_ENABLED=true`.
  - `/metrics` added to `authMiddleware.publicPaths` so scrapers can reach
    it without credentials.
- **`docs/observability.md`** — logs / metrics / traces guide, sample
  PromQL, example Grafana panel specs, and OpenTelemetry tracing wired as
  a documented follow-up (kept out of the runtime to avoid a large
  dependency bump in this release).

#### Enterprise-operations example (Slice 5)

- **`examples/08_enterprise_operations.py`** — the smoke test that
  corresponds to every new control:
  1. Authenticated request with `X-API-Key` and request-id correlation.
  2. Reads and prints `X-Request-Id` from the response for SIEM pivots.
  3. Probes an RBAC-gated endpoint (`POST /api/v1/admin/mcp/reload`) to
     demonstrate 401 / 403 semantics with graceful degradation when auth
     is off.
  4. Scrapes `/metrics` and prints the Prometheus lines.
- **`examples/stem_client.py`** — optional `api_key` and `bearer_token`
  constructor arguments with `STEM_API_KEY` / `STEM_BEARER_TOKEN` env
  fallbacks. New `metrics()` and `chat_with_meta()` helpers. Backward
  compatible — existing examples untouched.

#### Tests

- **`packages/standard-interface/src/__tests__/authorize.test.ts`** — 5
  cases covering `requirePermission` (401 no principal, 403 missing perm,
  200 allow) and `requireAnyPermission` (allow / deny).
- **`packages/standard-interface/src/__tests__/audit-log.test.ts`** — 3
  cases: one event per request when enabled, `decision: deny` on 403,
  no events when disabled. Uses an in-memory pino destination stream to
  assert on emitted JSON lines.
- **`packages/standard-interface/src/__tests__/security-headers.test.ts`**
  — 3 cases: headers present when mounted, absent when not mounted,
  overrides for CSP / HSTS / Referrer-Policy respected.

### Changed

- **`packages/standard-interface/src/gateway.ts`** — `GatewayConfig` gains
  optional `securityHeaders`, `auditLog`, and `metrics` sections. All
  default to disabled, so gateways constructed without the new fields
  behave identically to 0.1.1.
- **`docs/architecture.svg`** — reflects the new surface area:
  - Gateway bar subtitle now lists `audit-log · RBAC ·
    security-headers · /metrics`.
  - New lime-green **Enterprise Ops (opt-in)** protocol box in Layer 2
    with `RBAC · audit · CSP · /metrics`.
  - Differentiation layer *Domains* box updated: `sre · finance ·
    ai-research · healthcare · legal`.
  - Deployment strip rewritten to reference `Dockerfile (multi-stage ·
    non-root · tini)`, `docker-compose.prod.yml`, `deploy/k8s/`.
  - Testing strip bumped to 48 files / 526 tests and now lists RBAC ·
    Audit · Headers.
  - Legend gains an *Enterprise Ops* swatch; arrow legend shifted right
    to avoid overlap.
  - Inner boxes in the **Memory & Learning** and **MCP Integration**
    panels shifted down by 12px for breathing room under each section
    header.

### Fixed

- **`docker-compose.yml` prod profile** — was broken in 0.1.0 and 0.1.1
  because `dockerfile: Dockerfile` pointed to a file that did not exist.
  The `docker compose --profile prod up` path is now functional.
- **Dangling doc links** — `docs/getting_started.md` §6 referenced
  `SECURITY_ADDITION.md` (never shipped). Both occurrences now point to
  `docs/security.md`.
- **README cross-links** — top-level README now links to the new
  `docs/deployment.md`, `docs/security.md`, `docs/observability.md`, and
  the `domains/` industry personas.

### Documentation

- `docs/deployment.md`, `docs/security.md`, `docs/observability.md` — new.
- `docs/getting_started.md` — broken `SECURITY_ADDITION.md` link fixed;
  enterprise-ops section cross-references the three new docs.
- `env.example` — new opt-in envs documented with comments:
  `SECURITY_HELMET`, `AUDIT_LOG_ENABLED`, `METRICS_ENABLED`, `LOG_REDACT`,
  `STEM_API_KEY`, `STEM_BEARER_TOKEN`, plus placeholders for the
  (follow-up) OTEL envs.
- `examples/README.md` — new example 08 row + feature-coverage matrix
  column.
- `README.md` — new *Enterprise operations* section with a
  concern → control → enable matrix.

### Known limitations / still follow-up

- **Redis-backed rate limiter.** In-memory store remains; documented in
  `docs/deployment.md` under *Scaling caveats*. Deploying multiple
  replicas without fronting Redis means per-replica limits.
- **Distributed tracing.** `OTEL_ENABLED` placeholder is in `env.example`
  but the SDK is not yet wired — skipped to avoid a heavy dependency bump
  this release. Shape documented in `docs/observability.md`.
- **No new auth providers.** SAML and mTLS remain enum-only despite the
  `AuthMiddleware` contract admitting them. Tracked in `docs/security.md`
  follow-ups.
- **Pre-existing mcp-server test failures** remain unrelated: the
  `.mcp.json` and `.claude/rules/*-domain.md` fixtures are still absent.
  Confirmed failing identically on `main` before and after 0.1.2 by
  `git stash && npm run test --workspace=@stem-agent/mcp-server`.

### Test coverage after 0.1.2

| Workspace                        | Files | Tests | Δ vs 0.1.1 |
|----------------------------------|------:|------:|-----------:|
| `@stem-agent/mcp-integration`    |     8 |    65 |          — |
| `@stem-agent/memory-system`      |    11 |   153 |          — |
| `@stem-agent/agent-core`         |     7 |    85 |          — |
| `@stem-agent/standard-interface` |    14 |   113 |    +3 / +11 |
| `@stem-agent/caller-layer`       |     4 |    43 |          — |
| `@stem-agent/mcp-server`         | 3 of 4 |  76  | unchanged (pre-existing failure) |
| **Total**                        | **47 of 48** | **535** | **+3 / +11** |

Every new test is additive; the 0.1.1 suite passes untouched.

### References

- Slice plan: `/home/alfred/.claude/plans/dazzling-pondering-ladybug.md`.
- New middleware entry points: `packages/standard-interface/src/auth/authorize.ts`,
  `packages/standard-interface/src/middleware/security-headers.ts`,
  `packages/standard-interface/src/middleware/audit-log.ts`,
  `packages/standard-interface/src/observability/telemetry.ts`.
- Env-flag catalogue: `env.example` (bottom half) and
  `docs/security.md` control matrix.

---

## [0.1.1] — 2026-04-26

Patch release closing the P0 and P1 gaps from design review
`DR-2026-04-25-001` (*Agent Differentiation*). `DomainPersona` — previously
defined as "the differentiation primitive" but never wired into the
cognitive pipeline — now drives system prompts, reasoning strategy, tool
scope, refusal boundaries, and behavior overrides end-to-end. The cellular
skill-lifecycle half remains unchanged.

### Added

- **`DomainPersona` plumbing through agent-core.**
  - `StemAgent` constructor accepts an optional `persona?: DomainPersona`
    parameter (`packages/agent-core/src/orchestrator.ts`).
  - `getPersona()` accessor on `StemAgent`.
  - Persona `systemPrompt` is threaded into `PerceptionEngine`,
    `ReasoningEngine`, and `PlanningEngine` and prepended to every LLM
    system message.
  - Persona `preferredStrategy` is threaded into
    `ReasoningEngine.reason(perception, behavior, strategyOverride?)` and
    bypasses `StrategySelector` when set.
- **Persona guardrails (`orchestrator.ts`).**
  - `checkPersonaGuardrails()` — refuses requests whose perceived intent
    is not in `persona.allowedIntents`, or whose content contains a
    `persona.forbiddenTopics` substring. Both paths short-circuit before
    reasoning and return a structured refusal with
    `metadata.refusal = "intent_not_allowed" | "forbidden_topic"`.
  - `filterToolsByPersona()` — scopes MCP tools passed to the planner by
    `persona.toolAllowlist`; empty allowlist means all tools are permitted.
- **Caller-profile confidence gating (`orchestrator.ts:35-39`).**
  - `MIN_INTERACTIONS_FOR_TRUST = 5` and `CONFIDENCE_FOR_PROFILE = 0.5`
    module constants.
  - `adapt()` falls back to `perception.callerStyleSignals` when a profile
    is below either threshold and overlays `persona.defaultBehavior` on
    top of the resulting base, establishing a deterministic precedence
    order: defaults → caller-profile signals → persona overrides.
- **Meaningful skill crystallization.**
  - `storeEpisode()` now records `intent:<intent>` and `tool:<name>`
    actions (plus `domain`, `complexity`, `persona` context) so
    `SkillManager.detectPatterns` can actually group episodes by
    meaningful signatures. Previously every episode hashed to a single
    `["process"]` bucket, producing one useless auto-skill.
- **Entrypoint persona loading.**
  - New `src/persona-loader.ts` — shared helper that validates a
    `DomainPersona` JSON file via `DomainPersonaSchema` and dynamically
    imports compiled `dist/domains/<tag>/skills.js` for each
    `domainTag`, registering plugin skills into the agent's
    `SkillManager`. Missing domain files are logged and skipped so
    misconfiguration cannot crash the agent.
  - `src/server.ts` (HTTP gateway) now reads `DOMAIN_PERSONA`, parses it
    via `loadPersona`, passes it to `StemAgent`, and calls
    `registerPersonaDomainSkills`.
  - `src/mcp-entrypoint.ts` (stdio) does the same; previously the persona
    was read but only passed to the MCP wrapper, never into the
    underlying `StemAgent`.
- **Domain skills compile target.**
  - New `tsconfig.domains.json` compiles `domains/**/*.ts` into
    `dist/domains/` so `persona-loader` can import them at runtime.
  - Root `tsconfig.json` now references this project.
- **Public type export.**
  - `SkillPluginInput = Omit<z.input<typeof SkillSchema>, "id" | "createdAt" | "updatedAt">`
    exposed from `@stem-agent/agent-core` so downstream domain packages
    can rely on Zod-default semantics when authoring plugin skills.
- **Integration tests (`packages/agent-core/src/__tests__/orchestrator.test.ts`).**
  Nine new tests covering the differentiation pipeline end-to-end:
  1. Committed skill short-circuits reasoning + planning.
  2. Progenitor skills do *not* short-circuit.
  3. `persona.preferredStrategy` overrides `StrategySelector`.
  4. `persona.toolAllowlist` filters the tool set passed to the planner.
  5. `persona.forbiddenTopics` triggers refusal before `ReasoningEngine.reason()` is called.
  6. `persona.allowedIntents` rejects out-of-scope intents.
  7. `persona.defaultBehavior` overrides caller-profile adaptation.
  8. Low-confidence caller falls back to `perception.callerStyleSignals`.
  9. High-confidence caller uses the learned profile.

### Changed

- **`SkillManager.registerPlugin` signature.** Changed from
  `Omit<Skill, "id" | "createdAt" | "updatedAt">` to `SkillPluginInput`
  so defaulted Zod fields (`source`, `steps`, `trigger.entityTypes`,
  `tags`) remain optional at authoring time. No behavior change; domain
  skill files now type-check cleanly under `tsconfig.domains.json`.
- **Test assertion retargeting.**
  `packages/mcp-server/src/__tests__/mcp-entrypoint.test.ts` — the
  "imports `DomainPersonaSchema`" assertion now looks at
  `src/persona-loader.ts` (where the schema usage lives) rather than
  `src/mcp-entrypoint.ts`, reflecting the new shared-loader layer.
- **Version bump.** All eight `package.json` files bumped from
  `0.1.0` → `0.1.1`.

### Fixed

- Persona fields `systemPrompt`, `preferredStrategy`, `forbiddenTopics`,
  `toolAllowlist`, `allowedIntents`, `defaultBehavior`, and `domainTags`
  now have live consumers inside the agent core. In `0.1.0` all seven had
  zero live reads across `packages/agent-core/` and
  `packages/standard-interface/`.
- Flagship demo `examples/02_cell_differentiation.py` now runs against a
  differentiated server when the server is started with
  `DOMAIN_PERSONA=...`. (Rewriting the demo to drive multiple server
  instances simultaneously is tracked as P2 in the review.)

### Documentation

- `docs/design-reviews/2026-04-25-agent-differentiation-review.md` bumped
  to v2.0.0 (*Resolved*). Adds side-by-side v1.0.0 / v2.0.0 status
  tables, an updated traceability matrix, checked-off acceptance
  criteria, and a new §11 resolution summary listing every code change
  and every new test.

### Known limitations / still P2

- `examples/02_cell_differentiation.py` still constructs persona dicts
  client-side; the HTTP path ignores them. Running one server per
  persona via `DOMAIN_PERSONA=...` works and is honored end-to-end, but
  the demo script has not been rewritten to spawn multiple servers or
  hit a hot-swap endpoint.
- `packages/mcp-server/src/__tests__/skill-and-rules.test.ts` fails at
  file load time on missing `.claude/rules/finance-domain.md` and
  `.claude/rules/sre-domain.md`. Orthogonal to differentiation; these
  are Claude Code rule documents that have never existed in the repo.
- `npm run lint` is non-functional — ESLint 9 requires an
  `eslint.config.js` that the repo does not yet provide. Pre-existing;
  not a `0.1.1` regression.

### Test coverage after 0.1.1

| Workspace                  | Files | Tests |
|----------------------------|------:|------:|
| `@stem-agent/mcp-integration`  | 8 |  65 |
| `@stem-agent/memory-system`    | 11 | 153 |
| `@stem-agent/agent-core`       | 7 |  85 (17 in `orchestrator.test.ts`, up from 14) |
| `@stem-agent/standard-interface` | 11 | 102 |
| `@stem-agent/caller-layer`     | 4 |  43 |
| `@stem-agent/mcp-server`       | 3 of 4 passing | 76 (1 pre-existing file failure, unrelated) |
| **Total**                  | **44 of 45** | **524** |

### References

- Design review: [docs/design-reviews/2026-04-25-agent-differentiation-review.md](design-reviews/2026-04-25-agent-differentiation-review.md) (DR-2026-04-25-001, v2.0.0)
- Canonical differentiation constants: `packages/agent-core/src/orchestrator.ts:35-39`, `packages/agent-core/src/skills/skill-manager.ts:23-31`

---

## [0.1.0] — 2026-03-26 (baseline)

Initial public cut of the stem-agent monorepo. Includes:

- Five-layer architecture (Caller → Standard Interface → Agent Core → Memory → MCP).
- Eight-phase cognitive pipeline (Perceive, Adapt, Skill Match, Reason, Plan, Execute, Learn, Respond).
- Skill lifecycle with `progenitor` → `committed` → `mature` transitions and apoptosis on persistent failure.
- Caller Profiler with EMA-based learning over 20+ dimensions.
- Four-type memory system (episodic, semantic, procedural, user context) with ATLAS self-learning.
- Multi-protocol gateway: A2A, AG-UI, A2UI, UCP, AP2.
- Four framework adapters: AutoGen, CrewAI, LangGraph, OpenAI Agents SDK.
- `DomainPersona` type and `domains/{finance,sre}/` persona + skill definitions (defined but not wired — see 0.1.1).

[0.1.2]: #012--2026-05-05
[0.1.1]: #011--2026-04-26
[0.1.0]: #010--2026-03-26-baseline
