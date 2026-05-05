import pino from "pino";
/**
 * Default redaction paths. These cover the fields that should never land in
 * logs even by accident. Safe to enable by default because pino only redacts
 * paths that actually appear. Opt out with `LOG_REDACT=off`.
 */
const DEFAULT_REDACT_PATHS = [
    "req.headers.authorization",
    "req.headers.cookie",
    'req.headers["x-api-key"]',
    "*.password",
    "*.apiKey",
    "*.api_key",
    "*.token",
    "*.secret",
    "*.ssn",
];
function resolveRedactPaths() {
    const raw = process.env["LOG_REDACT"];
    if (raw === "off")
        return [];
    if (raw && raw.trim() !== "") {
        return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return DEFAULT_REDACT_PATHS;
}
/**
 * Structured logger factory using pino.
 * All packages use this for consistent logging with correlation IDs.
 */
export function createLogger(name, opts = {}) {
    // Logs must go to stderr: fd 1 is reserved for MCP stdio JSON-RPC frames
    // in mcp-entrypoint.ts, and stderr is also the right default for server
    // logs regardless of transport.
    const redactPaths = resolveRedactPaths();
    return pino({
        name,
        level: opts.level ?? process.env["LOG_LEVEL"] ?? "info",
        ...(redactPaths.length > 0
            ? { redact: { paths: redactPaths, censor: "[REDACTED]" } }
            : {}),
        ...(opts.correlationId
            ? { mixin: () => ({ correlationId: opts.correlationId }) }
            : {}),
    }, pino.destination(2));
}
/** Child logger with an attached correlation ID. */
export function withCorrelationId(logger, correlationId) {
    return logger.child({ correlationId });
}
//# sourceMappingURL=logger.js.map