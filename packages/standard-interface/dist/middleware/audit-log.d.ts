import type { Response, NextFunction } from "express";
import { type Logger } from "@stem-agent/shared";
import type { AuthenticatedRequest } from "../auth/auth-middleware.js";
/**
 * Audit-log middleware. When enabled, emits one structured event per request
 * to a dedicated pino child logger (name: "audit"). The event fires on
 * `res.finish`, so status + latency are known.
 *
 * Event shape (stable, consumed by SIEM pipelines):
 *
 * ```json
 * {
 *   "ts":        "2026-05-04T22:00:00.000Z",
 *   "requestId": "e1e2-...",
 *   "principal": { "id": "user-42", "type": "user" } | null,
 *   "action":    "POST /api/v1/chat",
 *   "resource":  "/api/v1/chat",
 *   "decision":  "allow" | "deny",
 *   "status":    200,
 *   "latencyMs": 412,
 *   "ip":        "10.0.1.7"
 * }
 * ```
 *
 * Gating: disabled by default. Caller enables by passing `enabled: true`
 * (typically wired from `AUDIT_LOG_ENABLED=true` env).
 *
 * Ship logs to a SIEM by piping stderr — the audit child writes through the
 * same stream as the root pino logger. Tag the audit stream downstream by
 * filtering on `name == "audit"`.
 */
export interface AuditLogConfig {
    enabled: boolean;
    /** Parent logger — audit events are emitted via `parent.child({ name: "audit" })`. */
    parentLogger?: Logger;
}
export declare function auditLogMiddleware(config: AuditLogConfig): (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=audit-log.d.ts.map