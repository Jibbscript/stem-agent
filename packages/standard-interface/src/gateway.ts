import express from "express";
import cors from "cors";
import compression from "compression";
import { createServer, type Server as HttpServer } from "node:http";
import { createLogger, type IStemAgent, type Logger, type IMCPManager, type IMemoryManager } from "@stem-agent/shared";
import { AuthMiddleware, type AuthConfig, type IAuthProvider, ApiKeyProvider, JwtProvider } from "./auth/index.js";
import {
  requestIdMiddleware,
  loggingMiddleware,
  RateLimiter,
  errorHandler,
  securityHeadersMiddleware,
  auditLogMiddleware,
  type RateLimitConfig,
  type SecurityHeadersConfig,
  type AuditLogConfig,
} from "./middleware/index.js";
import { A2AHandler, agentCardRouter } from "./a2a/index.js";
import { A2UIHandler } from "./a2ui/index.js";
import { AGUIHandler } from "./ag-ui/index.js";
import { Ap2Handler } from "./ap2/index.js";
import { UcpHandler } from "./ucp/index.js";
import { restRouter } from "./rest/index.js";
import { buildOpenApiSpec } from "./rest/openapi-spec.js";
import { WsHandler } from "./websocket/index.js";
import { initMetrics, type MetricsConfig } from "./observability/index.js";

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
export class Gateway {
  private readonly app: express.Application;
  private readonly httpServer: HttpServer;
  private readonly wsHandler: WsHandler;
  private readonly logger: Logger;
  private readonly config: GatewayConfig;

  constructor(
    private readonly agent: IStemAgent,
    config: GatewayConfig = {},
  ) {
    this.config = config;
    this.logger = createLogger("gateway", { level: config.logLevel });
    this.app = express();
    this.httpServer = createServer(this.app);

    this.setupMiddleware();
    this.setupRoutes();

    const wsAuthProviders: IAuthProvider[] = [];
    if (this.config.auth?.enabled) {
      if (this.config.auth.apiKey) {
        wsAuthProviders.push(new ApiKeyProvider(this.config.auth.apiKey));
      }
      if (this.config.auth.jwt) {
        wsAuthProviders.push(new JwtProvider(this.config.auth.jwt));
      }
    }
    this.wsHandler = new WsHandler(
      agent,
      this.logger,
      wsAuthProviders.length > 0 ? wsAuthProviders : undefined,
    );
    this.wsHandler.attach(this.httpServer);
  }

  /** Start listening for connections. */
  async start(): Promise<void> {
    const host = this.config.host ?? process.env["HOST"] ?? "127.0.0.1";
    const port = this.config.port ?? (process.env["PORT"] ? Number(process.env["PORT"]) : 8000);

    return new Promise((resolve) => {
      this.httpServer.listen(port, host, () => {
        this.logger.info({ host, port }, "gateway started");
        resolve();
      });
    });
  }

  /** Gracefully shutdown the gateway. */
  async stop(): Promise<void> {
    this.wsHandler.close();
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /** Access the underlying Express app (useful for testing with supertest). */
  getApp(): express.Application {
    return this.app;
  }

  /** Access the underlying HTTP server. */
  getHttpServer(): HttpServer {
    return this.httpServer;
  }

  private setupMiddleware(): void {
    // Body parsing
    this.app.use(express.json());

    // Request ID — early so downstream logs + audit events can reference it
    this.app.use(requestIdMiddleware);

    // Security headers (opt-in via config or SECURITY_HELMET=true)
    const securityHeadersEnabled =
      this.config.securityHeaders === true ||
      (typeof this.config.securityHeaders === "object" && this.config.securityHeaders !== null) ||
      process.env["SECURITY_HELMET"] === "true";
    if (securityHeadersEnabled) {
      const cfg =
        typeof this.config.securityHeaders === "object" && this.config.securityHeaders !== null
          ? this.config.securityHeaders
          : {};
      this.app.use(securityHeadersMiddleware(cfg));
    }

    // Logging
    this.app.use(loggingMiddleware(this.logger));

    // CORS — warn loudly if left wide-open so the risk is visible in logs
    const corsOrigin = this.config.corsOrigin ?? "*";
    if (corsOrigin === "*") {
      this.logger.warn(
        "CORS origin is '*' — any browser can reach this API. Set config.corsOrigin for production.",
      );
    }
    this.app.use(cors({ origin: corsOrigin }));

    // Compression
    this.app.use(compression());

    // Auth
    if (this.config.auth?.enabled) {
      const authMiddleware = new AuthMiddleware({
        ...this.config.auth,
        publicPaths: [
          "/.well-known/agent.json",
          "/.well-known/ucp",
          "/api/v1/health",
          "/docs",
          "/api-docs",
          "/metrics",
          ...(this.config.auth.publicPaths ?? []),
        ],
      });

      if (this.config.auth.apiKey) {
        authMiddleware.addProvider(new ApiKeyProvider(this.config.auth.apiKey));
      }
      if (this.config.auth.jwt) {
        authMiddleware.addProvider(new JwtProvider(this.config.auth.jwt));
      }

      this.app.use(authMiddleware.handler);
    }

    // Audit log (opt-in via config or AUDIT_LOG_ENABLED=true). Mounted after
    // auth so req.principal is available when the event fires.
    const auditEnabled =
      this.config.auditLog === true ||
      (typeof this.config.auditLog === "object" && this.config.auditLog !== null) ||
      process.env["AUDIT_LOG_ENABLED"] === "true";
    if (auditEnabled) {
      this.app.use(
        auditLogMiddleware({
          enabled: true,
          parentLogger: this.logger,
          ...(typeof this.config.auditLog === "object" && this.config.auditLog !== null
            ? this.config.auditLog
            : {}),
        }),
      );
    }

    // Rate limiting
    if (this.config.rateLimit) {
      const limiter = new RateLimiter(this.config.rateLimit);
      this.app.use(limiter.handler);
    }

    // Prometheus metrics (opt-in via config or METRICS_ENABLED=true)
    const metricsEnabled =
      this.config.metrics === true ||
      (typeof this.config.metrics === "object" && this.config.metrics !== null) ||
      process.env["METRICS_ENABLED"] === "true";
    if (metricsEnabled) {
      initMetrics(this.app, {
        enabled: true,
        ...(typeof this.config.metrics === "object" && this.config.metrics !== null
          ? this.config.metrics
          : {}),
      });
    }
  }

  private setupRoutes(): void {
    // A2A agent card
    this.app.use(agentCardRouter(this.agent));

    // A2A JSON-RPC endpoint
    const a2aHandler = new A2AHandler(this.agent);
    this.app.use(a2aHandler.createRouter());

    // A2UI dynamic UI composition
    const a2uiHandler = new A2UIHandler(this.agent);
    this.app.use(a2uiHandler.createRouter());

    // AG-UI SSE endpoint
    const aguiHandler = new AGUIHandler(this.agent);
    this.app.use(aguiHandler.createRouter());

    // AP2 payment authorization
    const ap2Handler = new Ap2Handler();
    this.app.use(ap2Handler.createRouter());

    // UCP checkout + discovery endpoints
    const ucpHandler = new UcpHandler(this.agent);
    this.app.use(ucpHandler.createRouter());

    // REST API
    this.app.use(restRouter({
      agent: this.agent,
      memoryManager: this.config.memoryManager,
      mcpManager: this.config.mcpManager,
    }));

    // OpenAPI spec endpoint
    this.app.get("/api-docs", (_req, res) => {
      const card = this.agent.getAgentCard();
      res.json(buildOpenApiSpec(card.name, card.version));
    });

    // Swagger UI (if swagger-ui-express is available)
    try {
      // Dynamic import to make swagger-ui-express optional
      void import("swagger-ui-express").then((swaggerUi) => {
        const card = this.agent.getAgentCard();
        const spec = buildOpenApiSpec(card.name, card.version);
        this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
      });
    } catch {
      this.logger.debug("swagger-ui-express not available, /docs disabled");
    }

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }
}
