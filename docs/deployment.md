# Deployment Guide

This guide covers deploying STEM Agent beyond the development quickstart.
It assumes you've read `README.md` and `docs/getting_started.md`.

## Topology choices

| Tier | Compute | State | Notes |
|------|---------|-------|-------|
| Local dev | `docker compose up` | containers (postgres + redis) | everything on one host |
| Staging | 1 pod / single VM | managed Postgres, managed Redis | single replica; fine with in-memory rate limiter |
| Production | 2+ pods / Fargate / ECS | managed Postgres + Redis + Secrets Manager | see **Scaling caveats** below |

The agent itself is stateless — all durable state lives in Postgres (episodic
memory, semantic triples, procedural skills, caller profiles) and Redis (task
queue, caches). This makes horizontal scaling *mostly* straightforward. The
two exceptions are documented in **Scaling caveats**.

## Build

```bash
# From the repo root — produces stem-agent:latest locally.
docker build -t stem-agent:latest .

# Tag and push to your registry.
docker tag stem-agent:latest ghcr.io/your-org/stem-agent:0.1.1
docker push ghcr.io/your-org/stem-agent:0.1.1
```

The image:
- Builds in a `node:22-slim` stage, runs in a separate `node:22-slim` stage.
- Runs as the non-root `node` user, `tini` as PID 1.
- Includes `curl` for the `HEALTHCHECK` against `/api/v1/health`.
- Prunes devDependencies before copying to the runtime stage.

## Docker Compose

### Local (builds locally, local Postgres + Redis)

```bash
cp env.example .env
docker compose --profile prod up -d
```

### Production (externalized state)

```bash
export STEM_AGENT_IMAGE=ghcr.io/your-org/stem-agent:0.1.1
export DATABASE_URL="postgresql://user:pass@rds.example.com:5432/stem_agent"
export REDIS_URL="redis://cache.example.com:6379"
docker compose -f docker-compose.prod.yml up -d stem-agent
```

See `docker-compose.prod.yml` for the full environment-variable contract.
The overlay intentionally does **not** start local Postgres or Redis — it
expects managed services.

## Kubernetes

Example manifests live under `deploy/k8s/`. Apply order and caveats are
documented in `deploy/k8s/README.md`.

Highlights:
- Non-root container (`runAsUser: 1000`), read-only root FS, `emptyDir` for `/tmp`.
- Readiness + liveness on `/api/v1/health`.
- HPA on CPU (70%) and memory (80%), 2–10 replicas.
- `prometheus.io/scrape` annotations for `/metrics` (when `METRICS_ENABLED=true`).

Adapt before shipping:
- Image registry in `deployment.yaml`.
- Ingress / LoadBalancer (not provided — cluster-specific).
- NetworkPolicy (not provided — selectors depend on namespace).
- PodDisruptionBudget (recommended: `minAvailable: 1`).

## Secrets management

Never bake secrets into images or ConfigMaps. Pick one:

| Platform | Recommended |
|----------|-------------|
| AWS / EKS | Secrets Store CSI Driver + AWS Secrets Manager, or IRSA for AWS API auth |
| GCP / GKE | Workload Identity + Secret Manager |
| Azure / AKS | Azure Key Vault Provider for Secrets Store CSI Driver |
| Self-hosted | HashiCorp Vault + vault-k8s injector |
| Any | External Secrets Operator (syncs to native K8s Secrets) |

For the LLM provider, prefer cloud-native auth (IAM roles for Bedrock, GCP
Workload Identity for Vertex) over long-lived API keys.

## Environment tiers

| Env var | Dev | Staging | Prod |
|---------|-----|---------|------|
| `NODE_ENV` | `development` | `production` | `production` |
| `LOG_LEVEL` | `debug` | `info` | `info` |
| `HOST` | `127.0.0.1` | `0.0.0.0` | `0.0.0.0` |
| `SECURITY_HELMET` | off | on | on |
| `AUDIT_LOG_ENABLED` | off | on | on |
| `METRICS_ENABLED` | off | on | on |
| `OTEL_ENABLED` | off | on | on |

All opt-in flags default **off** so that existing integrations keep working.
See `docs/security.md` and `docs/observability.md` for details.

## Health & readiness

- `GET /api/v1/health` — returns `{status:"ok", ...}` once the gateway is up.
- `GET /.well-known/agent.json` — A2A agent card; also confirms readiness.
- `GET /metrics` — Prometheus exposition, only when `METRICS_ENABLED=true`.

For Kubernetes, readiness uses `/api/v1/health` (same endpoint the Dockerfile
HEALTHCHECK targets). Extend with dependency checks (DB + Redis ping) when
stricter readiness is required.

## Rolling updates

- `strategy.type: RollingUpdate`, `maxSurge: 1`, `maxUnavailable: 0` — zero-downtime.
- `terminationGracePeriodSeconds: 30` — lets in-flight A2A tasks drain.
- If you use async tasks that outlive a pod lifetime, persist them (out of scope
  here — current task queue is Redis-based and already survives pod restarts).

## Scaling caveats

Two pieces of state are currently in-process and do not share across replicas:

1. **Rate limiter** (`packages/standard-interface/src/middleware/rate-limit.ts`)
   — token bucket keyed by principal id, stored in a local `Map`.
   - Impact: a client making 10 rps against 4 replicas sees each replica's
     limit independently — effective throughput is `4 × limit`.
   - Mitigations:
     (a) pin clients via ingress sticky sessions (simple, partial),
     (b) accept per-pod limits (documented, often fine for low-QPS agents),
     (c) replace with a Redis-backed limiter (follow-up work; `rate-limit.ts`
     is intentionally small for this swap).

2. **AP2 payment-intent store** (`packages/standard-interface/src/ap2/ap2-handler.ts`)
   — audit trail kept in an in-memory `Map`.
   - Impact: approval/rejection must hit the same pod as intent creation.
   - Mitigation: route `/ap2/*` to a single primary via header-based routing,
     or disable AP2 until a durable backend is wired.

Everything else (Postgres, Redis, pino logs, metrics via `prom-client` with
default registry) scales horizontally without changes.

## Cost & concurrency

- `MAX_CONCURRENT_TASKS` caps the in-flight async task pool per pod.
- `COST_MAX_LLM_CALLS`, `COST_MAX_PER_INTERACTION_USD`, and related envs gate
  LLM spend per interaction; see `env.example` for the full list.
- With Bedrock, prefer IAM roles over long-lived access keys (no key rotation
  chore, and per-pod identity works with IRSA / Workload Identity).

## Verification checklist

After deploying, confirm:

```bash
curl -sf https://your-host/api/v1/health
curl -sf https://your-host/.well-known/agent.json | jq .name
curl -sf https://your-host/metrics | head       # if METRICS_ENABLED=true
```

Then run the enterprise-ops smoke test:

```bash
STEM_AGENT_URL=https://your-host \
STEM_API_KEY=... \
python examples/08_enterprise_operations.py
```

## Follow-ups (not shipped here)

- Redis-backed rate limiter for true horizontal scaling.
- PodDisruptionBudget + NetworkPolicy sample.
- Helm chart packaging the manifests above.
- Terraform modules for AWS / GCP / Azure target environments.
- CI/CD workflow for image build + push + sign (cosign).
