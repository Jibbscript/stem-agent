import type { Application, Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Minimal, dependency-free Prometheus `/metrics` endpoint.
 *
 * We deliberately avoid pulling `prom-client` here — it works great, but it's
 * a heavy dependency to add for a feature that is opt-in and illustrative.
 * This module exposes three counters and one histogram, rendered in the
 * Prometheus text exposition format. Teams that want the full `prom-client`
 * ecosystem can swap this out — shapes line up.
 *
 * Proper OpenTelemetry tracing with OTLP export is documented as follow-up
 * work in `docs/observability.md`.
 */
export interface MetricsConfig {
  enabled: boolean;
  /** Path for the exposition endpoint. Defaults to "/metrics". */
  path?: string;
  /** Extra label added to every metric — e.g. `{service: "stem-agent"}`. */
  defaultLabels?: Record<string, string>;
}

/** Simple counter — monotonic, labeled. */
class Counter {
  private readonly values = new Map<string, number>();
  constructor(
    readonly name: string,
    readonly help: string,
    readonly labelKeys: string[] = [],
  ) {}

  inc(labels: Record<string, string> = {}, by = 1): void {
    const key = this.encode(labels);
    this.values.set(key, (this.values.get(key) ?? 0) + by);
  }

  render(defaultLabels: Record<string, string>): string {
    const lines = [
      `# HELP ${this.name} ${this.help}`,
      `# TYPE ${this.name} counter`,
    ];
    for (const [key, value] of this.values) {
      const labels = { ...defaultLabels, ...this.decode(key) };
      lines.push(`${this.name}${renderLabels(labels)} ${value}`);
    }
    return lines.join("\n");
  }

  private encode(labels: Record<string, string>): string {
    return this.labelKeys.map((k) => `${k}=${labels[k] ?? ""}`).join("|");
  }
  private decode(key: string): Record<string, string> {
    if (!key) return {};
    const out: Record<string, string> = {};
    for (const pair of key.split("|")) {
      const [k, v] = pair.split("=");
      if (k) out[k] = v ?? "";
    }
    return out;
  }
}

/** Fixed-bucket histogram (seconds). */
class Histogram {
  private readonly buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
  private readonly counts = new Map<string, number[]>(); // key -> per-bucket + +Inf
  private readonly sums = new Map<string, number>();
  private readonly totals = new Map<string, number>();

  constructor(
    readonly name: string,
    readonly help: string,
    readonly labelKeys: string[] = [],
  ) {}

  observe(labels: Record<string, string>, valueSeconds: number): void {
    const key = this.encode(labels);
    if (!this.counts.has(key)) {
      this.counts.set(key, Array(this.buckets.length + 1).fill(0));
    }
    const arr = this.counts.get(key)!;
    for (let i = 0; i < this.buckets.length; i++) {
      if (valueSeconds <= this.buckets[i]!) arr[i]!++;
    }
    arr[this.buckets.length]!++; // +Inf
    this.sums.set(key, (this.sums.get(key) ?? 0) + valueSeconds);
    this.totals.set(key, (this.totals.get(key) ?? 0) + 1);
  }

  render(defaultLabels: Record<string, string>): string {
    const lines = [
      `# HELP ${this.name} ${this.help}`,
      `# TYPE ${this.name} histogram`,
    ];
    for (const [key, arr] of this.counts) {
      const labels = { ...defaultLabels, ...this.decode(key) };
      for (let i = 0; i < this.buckets.length; i++) {
        const le = this.buckets[i]!.toString();
        lines.push(`${this.name}_bucket${renderLabels({ ...labels, le })} ${arr[i]}`);
      }
      lines.push(`${this.name}_bucket${renderLabels({ ...labels, le: "+Inf" })} ${arr[this.buckets.length]}`);
      lines.push(`${this.name}_sum${renderLabels(labels)} ${this.sums.get(key) ?? 0}`);
      lines.push(`${this.name}_count${renderLabels(labels)} ${this.totals.get(key) ?? 0}`);
    }
    return lines.join("\n");
  }

  private encode(labels: Record<string, string>): string {
    return this.labelKeys.map((k) => `${k}=${labels[k] ?? ""}`).join("|");
  }
  private decode(key: string): Record<string, string> {
    if (!key) return {};
    const out: Record<string, string> = {};
    for (const pair of key.split("|")) {
      const [k, v] = pair.split("=");
      if (k) out[k] = v ?? "";
    }
    return out;
  }
}

function renderLabels(labels: Record<string, string>): string {
  const entries = Object.entries(labels).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "";
  const body = entries.map(([k, v]) => `${k}="${escape(v)}"`).join(",");
  return `{${body}}`;
}
function escape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

/** Registry singleton — scoped to this module to keep state simple. */
class Registry {
  readonly requestsTotal = new Counter(
    "stem_agent_http_requests_total",
    "Total HTTP requests handled by the gateway",
    ["method", "route", "status"],
  );
  readonly requestDuration = new Histogram(
    "stem_agent_http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "route", "status"],
  );
  readonly errorsTotal = new Counter(
    "stem_agent_http_errors_total",
    "HTTP 5xx responses",
    ["method", "route"],
  );

  render(defaultLabels: Record<string, string>): string {
    return [
      this.requestsTotal.render(defaultLabels),
      this.requestDuration.render(defaultLabels),
      this.errorsTotal.render(defaultLabels),
      "", // trailing newline required by some scrapers
    ].join("\n");
  }
}

const registry = new Registry();

/** Middleware that records per-request counters + duration histogram. */
export function metricsMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const elapsed = Number(process.hrtime.bigint() - start) / 1e9;
      // route is not yet resolved on res — fall back to req.path
      const labels = {
        method: req.method,
        route: req.route?.path ?? req.path,
        status: String(res.statusCode),
      };
      registry.requestsTotal.inc(labels);
      registry.requestDuration.observe(labels, elapsed);
      if (res.statusCode >= 500) {
        registry.errorsTotal.inc({ method: labels.method, route: labels.route });
      }
    });
    next();
  };
}

/**
 * Wire `/metrics` onto the given Express app and install the measurement
 * middleware. No-op if `config.enabled` is false.
 */
export function initMetrics(app: Application, config: MetricsConfig): void {
  if (!config.enabled) return;
  const path = config.path ?? "/metrics";
  const defaults = config.defaultLabels ?? {};

  app.use(metricsMiddleware());
  app.get(path, (_req, res) => {
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.status(200).send(registry.render(defaults));
  });
}

/** Exposed for tests. */
export function _resetRegistryForTests(): void {
  // Rebuilding Maps in-place preserves object identity.
  (registry.requestsTotal as unknown as { values: Map<string, number> }).values.clear();
  (registry.errorsTotal as unknown as { values: Map<string, number> }).values.clear();
}
