import express from "express";
import { type Server as HttpServer } from "node:http";
import { type IStemAgent, type IMCPManager, type IMemoryManager } from "@stem-agent/shared";
import { type AuthConfig } from "./auth/index.js";
import { type RateLimitConfig, type SecurityHeadersConfig, type AuditLogConfig } from "./middleware/index.js";
import { type MetricsConfig } from "./observability/index.js";
/**
 * Configuration for the Gateway.
 */
export interface GatewayConfig {
    /** Server host. Defaults to HOST env or "127.0.0.1". */
    host?: string;
    /** Server port. Defaults to PORT env or 8000. */
    port?: number;
    /** Auth configuration. */
    auth?: AuthConfig;
    /** Rate limiting configuration. */
    rateLimit?: RateLimitConfig;
    /** CORS origin. Defaults to "*". */
    corsOrigin?: string | string[];
    /** Log level. Defaults to "info". */
    logLevel?: string;
    /** Optional MCP manager for tool introspection routes. */
    mcpManager?: IMCPManager;
    /** Optional memory manager for profile routes. */
    memoryManager?: IMemoryManager;
    /**
     * Opt-in security headers. When provided (or when SECURITY_HELMET=true),
     * attaches a hand-rolled helmet-style header middleware. Default: disabled.
     */
    securityHeaders?: SecurityHeadersConfig | boolean;
    /**
     * Opt-in audit log. When enabled (config or AUDIT_LOG_ENABLED=true), emits
     * one structured event per request via a dedicated pino child logger.
     */
    auditLog?: Partial<AuditLogConfig> | boolean;
    /**
     * Opt-in Prometheus metrics. When enabled (config or METRICS_ENABLED=true),
     * records HTTP request counters + duration histogram and exposes them at
     * `/metrics` in the Prometheus text format.
     */
    metrics?: Partial<MetricsConfig> | boolean;
}
/**
 * Unified Gateway that routes requests to the appropriate protocol handler.
 * Mounts A2A, REST, WebSocket endpoints with shared auth and middleware.
 */
export declare class Gateway {
    private readonly agent;
    private readonly app;
    private readonly httpServer;
    private readonly wsHandler;
    private readonly logger;
    private readonly config;
    constructor(agent: IStemAgent, config?: GatewayConfig);
    /** Start listening for connections. */
    start(): Promise<void>;
    /** Gracefully shutdown the gateway. */
    stop(): Promise<void>;
    /** Access the underlying Express app (useful for testing with supertest). */
    getApp(): express.Application;
    /** Access the underlying HTTP server. */
    getHttpServer(): HttpServer;
    private setupMiddleware;
    private setupRoutes;
}
//# sourceMappingURL=gateway.d.ts.map