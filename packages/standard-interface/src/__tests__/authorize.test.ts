import { describe, it, expect } from "vitest";
import express, { type Request, type Response, type NextFunction } from "express";
import request from "supertest";
import type { Principal } from "@stem-agent/shared";
import { errorHandler } from "../middleware/error-handler.js";
import { requirePermission, requireAnyPermission } from "../auth/authorize.js";

/**
 * Helper: attach a Principal to req.principal before the permission check
 * runs. In production, AuthMiddleware is what does this.
 */
function injectPrincipal(principal: Principal | null) {
  return (req: Request & { principal?: Principal }, _res: Response, next: NextFunction) => {
    if (principal) req.principal = principal;
    next();
  };
}

function makePrincipal(permissions: string[]): Principal {
  return {
    id: "test-user",
    type: "user",
    attributes: {},
    roles: [],
    permissions,
    credential: { type: "api_key", value: "x", metadata: {} },
  };
}

function buildApp(principal: Principal | null, middleware: express.RequestHandler) {
  const app = express();
  app.use(injectPrincipal(principal));
  app.get("/admin", middleware, (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);
  return app;
}

describe("requirePermission", () => {
  it("returns 401 when no principal is attached", async () => {
    const app = buildApp(null, requirePermission("admin:write"));
    const res = await request(app).get("/admin");
    expect(res.status).toBe(401);
  });

  it("returns 403 when the principal lacks the permission", async () => {
    const app = buildApp(makePrincipal(["user:read"]), requirePermission("admin:write"));
    const res = await request(app).get("/admin");
    expect(res.status).toBe(403);
  });

  it("allows the request when the permission is present", async () => {
    const app = buildApp(makePrincipal(["admin:write"]), requirePermission("admin:write"));
    const res = await request(app).get("/admin");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("requireAnyPermission", () => {
  it("allows when any of the listed permissions is granted", async () => {
    const app = buildApp(
      makePrincipal(["operator:read"]),
      requireAnyPermission("admin:write", "operator:read"),
    );
    const res = await request(app).get("/admin");
    expect(res.status).toBe(200);
  });

  it("403s when none match", async () => {
    const app = buildApp(
      makePrincipal(["user:read"]),
      requireAnyPermission("admin:write", "operator:read"),
    );
    const res = await request(app).get("/admin");
    expect(res.status).toBe(403);
  });
});
