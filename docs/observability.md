# Observability Guide

STEM Agent emits three telemetry signals:

| Signal | Implementation | Status |
|--------|----------------|--------|
| Structured logs | pino (`shared/src/logger.ts`) | **Always on** |
| Prometheus metrics | hand-rolled registry (`packages/standard-interface/src/observability/telemetry.ts`) | **Opt-in** |
| Distributed traces (OTLP) | — | **Follow-up work** |

## Logs

Every subsystem uses `createLogger(name, ...)` from `shared`. All logs are
written to stderr as JSONL — stdout is reserved for the MCP stdio transport.

Per-request logs include:
- `method`, `path`, `status`, `durationMs`, `requestId`.

Redaction defaults are covered in `docs/security.md §Log redaction`.

### Shipping logs

pino writes JSONL to stderr; pick up with any agent:

```text
stem-agent → stderr → fluent-bit / vector / datadog-agent → your backend
```

Because pino names its loggers (`createLogger("gateway")`), downstream
filters can split streams, e.g. `name == "audit"` into a separate index.

### Correlation IDs

`createLogger(name, { correlationId })` pins a correlation ID via pino's
`mixin`. Use `withCorrelationId(logger, id)` for the same on an existing
child logger. For request-scoped correlation, the gateway sets and echoes
`X-Request-Id` via `requestIdMiddleware`.

## Metrics

Opt in by setting `METRICS_ENABLED=true` or passing `metrics: true` to
`new Gateway(...)`. This registers three metrics and mounts
`GET /metrics` in Prometheus text format.

### Exposed metrics

| Name | Type | Labels |
|------|------|--------|
| `stem_agent_http_requests_total` | Counter | `method`, `route`, `status` |
| `stem_agent_http_request_duration_seconds` | Histogram | `method`, `route`, `status` |
| `stem_agent_http_errors_total` | Counter | `method`, `route` |

Histogram buckets: `0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10` seconds.

### Scraping

```bash
curl -s http://localhost:8000/metrics | head -20
```

Kubernetes: `deploy/k8s/deployment.yaml` includes
`prometheus.io/scrape`, `prometheus.io/port`, `prometheus.io/path`
annotations. Use the Prometheus Operator `PodMonitor` or simple annotation
scraping with kube-prometheus-stack.

### Useful PromQL

```promql
# Error rate (5xx) by route, last 5 min
sum by (route) (rate(stem_agent_http_errors_total[5m]))

# p95 latency by route
histogram_quantile(0.95,
  sum by (route, le) (rate(stem_agent_http_request_duration_seconds_bucket[5m]))
)

# RPS by status class
sum by (status) (rate(stem_agent_http_requests_total[1m]))
```

### Why not `prom-client`?

`prom-client` is the industry standard and you should probably migrate to it
once your metrics needs grow beyond HTTP (e.g., LLM cost gauges,
memory-bucket sizes, skill activation counters). The shapes here match
`prom-client`'s exposition format exactly, so swapping in is mechanical.

## Distributed tracing (follow-up)

Not yet implemented. When it lands, the design will be:

- `@opentelemetry/sdk-node` + `@opentelemetry/auto-instrumentations-node` initialized
  behind `OTEL_ENABLED=true`.
- OTLP HTTP exporter targeting `OTEL_EXPORTER_OTLP_ENDPOINT`.
- pino mixin that reads the active span context and adds `traceId`/`spanId`
  to every log line.

Interim workaround: `X-Request-Id` propagation lets you pivot from logs →
requests, which covers most investigation paths.

## Enterprise-ops smoke test

The example `examples/08_enterprise_operations.py` exercises:
1. An authenticated call with `X-API-Key`.
2. Correlating the response `X-Request-Id` with a log line.
3. Hitting `/metrics` and printing one histogram sample.

Run against a gateway started with `METRICS_ENABLED=true` and an API key
provider configured.

## Checklist before going live

- [ ] `METRICS_ENABLED=true`, scrape configured, dashboard wired.
- [ ] `AUDIT_LOG_ENABLED=true`, audit stream shipped to SIEM.
- [ ] `LOG_REDACT` reviewed (add any app-specific PII paths).
- [ ] Alerts on `stem_agent_http_errors_total` and p95 latency thresholds.
- [ ] Runbook links in alerts pointing to `docs/deployment.md` + incident contacts.
