import { createLogger } from "@stem-agent/shared";
export function auditLogMiddleware(config) {
    if (!config.enabled) {
        // Pass-through when disabled — zero overhead.
        return (_req, _res, next) => {
            next();
        };
    }
    const parent = config.parentLogger ?? createLogger("gateway");
    const audit = parent.child({ name: "audit" });
    return (req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const requestId = req.headers["x-request-id"] ?? null;
            const denied = res.statusCode === 401 || res.statusCode === 403;
            audit.info({
                ts: new Date().toISOString(),
                requestId,
                principal: req.principal
                    ? { id: req.principal.id, type: req.principal.type }
                    : null,
                action: `${req.method} ${req.path}`,
                resource: req.path,
                decision: denied ? "deny" : "allow",
                status: res.statusCode,
                latencyMs: Date.now() - start,
                ip: req.ip ?? null,
            }, "audit");
        });
        next();
    };
}
//# sourceMappingURL=audit-log.js.map