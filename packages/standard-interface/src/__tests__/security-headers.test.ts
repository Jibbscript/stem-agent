import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { securityHeadersMiddleware } from "../middleware/security-headers.js";

function buildApp(attach: boolean) {
  const app = express();
  if (attach) app.use(securityHeadersMiddleware());
  app.get("/ping", (_req, res) => res.json({ ok: true }));
  return app;
}

describe("securityHeadersMiddleware", () => {
  it("sets the expected headers when mounted", async () => {
    const res = await request(buildApp(true)).get("/ping");
    expect(res.status).toBe(200);
    expect(res.headers["content-security-policy"]).toBe(
      "default-src 'none'; frame-ancestors 'none'",
    );
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["referrer-policy"]).toBe("no-referrer");
    expect(res.headers["permissions-policy"]).toBe(
      "geolocation=(), microphone=(), camera=()",
    );
    expect(res.headers["strict-transport-security"]).toBe(
      "max-age=31536000; includeSubDomains",
    );
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("omits headers when not mounted", async () => {
    const res = await request(buildApp(false)).get("/ping");
    expect(res.status).toBe(200);
    expect(res.headers["content-security-policy"]).toBeUndefined();
    expect(res.headers["x-frame-options"]).toBeUndefined();
    expect(res.headers["strict-transport-security"]).toBeUndefined();
  });

  it("honors overrides for CSP, HSTS, and Referrer-Policy", async () => {
    const app = express();
    app.use(
      securityHeadersMiddleware({
        contentSecurityPolicy: "default-src 'self'",
        hstsMaxAge: 0,
        referrerPolicy: "same-origin",
      }),
    );
    app.get("/ping", (_req, res) => res.json({ ok: true }));
    const res = await request(app).get("/ping");
    expect(res.headers["content-security-policy"]).toBe("default-src 'self'");
    expect(res.headers["referrer-policy"]).toBe("same-origin");
    expect(res.headers["strict-transport-security"]).toBeUndefined();
  });
});
