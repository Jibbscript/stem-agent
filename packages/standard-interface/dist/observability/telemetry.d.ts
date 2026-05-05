import type { Application, RequestHandler } from "express";
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
/** Middleware that records per-request counters + duration histogram. */
export declare function metricsMiddleware(): RequestHandler;
/**
 * Wire `/metrics` onto the given Express app and install the measurement
 * middleware. No-op if `config.enabled` is false.
 */
export declare function initMetrics(app: Application, config: MetricsConfig): void;
/** Exposed for tests. */
export declare function _resetRegistryForTests(): void;
//# sourceMappingURL=telemetry.d.ts.map