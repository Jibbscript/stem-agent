/** Simple counter — monotonic, labeled. */
class Counter {
    name;
    help;
    labelKeys;
    values = new Map();
    constructor(name, help, labelKeys = []) {
        this.name = name;
        this.help = help;
        this.labelKeys = labelKeys;
    }
    inc(labels = {}, by = 1) {
        const key = this.encode(labels);
        this.values.set(key, (this.values.get(key) ?? 0) + by);
    }
    render(defaultLabels) {
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
    encode(labels) {
        return this.labelKeys.map((k) => `${k}=${labels[k] ?? ""}`).join("|");
    }
    decode(key) {
        if (!key)
            return {};
        const out = {};
        for (const pair of key.split("|")) {
            const [k, v] = pair.split("=");
            if (k)
                out[k] = v ?? "";
        }
        return out;
    }
}
/** Fixed-bucket histogram (seconds). */
class Histogram {
    name;
    help;
    labelKeys;
    buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    counts = new Map(); // key -> per-bucket + +Inf
    sums = new Map();
    totals = new Map();
    constructor(name, help, labelKeys = []) {
        this.name = name;
        this.help = help;
        this.labelKeys = labelKeys;
    }
    observe(labels, valueSeconds) {
        const key = this.encode(labels);
        if (!this.counts.has(key)) {
            this.counts.set(key, Array(this.buckets.length + 1).fill(0));
        }
        const arr = this.counts.get(key);
        for (let i = 0; i < this.buckets.length; i++) {
            if (valueSeconds <= this.buckets[i])
                arr[i]++;
        }
        arr[this.buckets.length]++; // +Inf
        this.sums.set(key, (this.sums.get(key) ?? 0) + valueSeconds);
        this.totals.set(key, (this.totals.get(key) ?? 0) + 1);
    }
    render(defaultLabels) {
        const lines = [
            `# HELP ${this.name} ${this.help}`,
            `# TYPE ${this.name} histogram`,
        ];
        for (const [key, arr] of this.counts) {
            const labels = { ...defaultLabels, ...this.decode(key) };
            for (let i = 0; i < this.buckets.length; i++) {
                const le = this.buckets[i].toString();
                lines.push(`${this.name}_bucket${renderLabels({ ...labels, le })} ${arr[i]}`);
            }
            lines.push(`${this.name}_bucket${renderLabels({ ...labels, le: "+Inf" })} ${arr[this.buckets.length]}`);
            lines.push(`${this.name}_sum${renderLabels(labels)} ${this.sums.get(key) ?? 0}`);
            lines.push(`${this.name}_count${renderLabels(labels)} ${this.totals.get(key) ?? 0}`);
        }
        return lines.join("\n");
    }
    encode(labels) {
        return this.labelKeys.map((k) => `${k}=${labels[k] ?? ""}`).join("|");
    }
    decode(key) {
        if (!key)
            return {};
        const out = {};
        for (const pair of key.split("|")) {
            const [k, v] = pair.split("=");
            if (k)
                out[k] = v ?? "";
        }
        return out;
    }
}
function renderLabels(labels) {
    const entries = Object.entries(labels).filter(([, v]) => v !== undefined);
    if (entries.length === 0)
        return "";
    const body = entries.map(([k, v]) => `${k}="${escape(v)}"`).join(",");
    return `{${body}}`;
}
function escape(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
/** Registry singleton — scoped to this module to keep state simple. */
class Registry {
    requestsTotal = new Counter("stem_agent_http_requests_total", "Total HTTP requests handled by the gateway", ["method", "route", "status"]);
    requestDuration = new Histogram("stem_agent_http_request_duration_seconds", "HTTP request latency in seconds", ["method", "route", "status"]);
    errorsTotal = new Counter("stem_agent_http_errors_total", "HTTP 5xx responses", ["method", "route"]);
    render(defaultLabels) {
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
export function metricsMiddleware() {
    return (req, res, next) => {
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
export function initMetrics(app, config) {
    if (!config.enabled)
        return;
    const path = config.path ?? "/metrics";
    const defaults = config.defaultLabels ?? {};
    app.use(metricsMiddleware());
    app.get(path, (_req, res) => {
        res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
        res.status(200).send(registry.render(defaults));
    });
}
/** Exposed for tests. */
export function _resetRegistryForTests() {
    // Rebuilding Maps in-place preserves object identity.
    registry.requestsTotal.values.clear();
    registry.errorsTotal.values.clear();
}
//# sourceMappingURL=telemetry.js.map