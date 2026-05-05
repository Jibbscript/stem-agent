import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import pino from "pino";
import { auditLogMiddleware } from "../middleware/audit-log.js";

/**
 * Build a pino logger that appends every log line to a captured array so we
 * can assert on emitted events. pino writes newline-delimited JSON to the
 * provided stream.
 */
function captureLogger(): { logger: pino.Logger; lines: Record<string, unknown>[] } {
  const lines: Record<string, unknown>[] = [];
  const stream = {
    write(chunk: string) {
      for (const raw of chunk.split("\n")) {
        if (!raw) continue;
        try {
          lines.push(JSON.parse(raw));
        } catch {
          // ignore non-JSON lines
        }
      }
    },
  };
  const logger = pino({ level: "info" }, stream as pino.DestinationStream);
  return { logger, lines };
}

describe("auditLogMiddleware", () => {
  it("emits one audit event per request when enabled", async () => {
    const { logger, lines } = captureLogger();
    const app = express();
    app.use(auditLogMiddleware({ enabled: true, parentLogger: logger }));
    app.get("/hello", (_req, res) => res.json({ ok: true }));

    const res = await request(app).get("/hello").set("x-request-id", "req-1");
    expect(res.status).toBe(200);

    const auditEvents = lines.filter((l) => l.name === "audit");
    expect(auditEvents).toHaveLength(1);
    const ev = auditEvents[0];
    expect(ev.action).toBe("GET /hello");
    expect(ev.resource).toBe("/hello");
    expect(ev.decision).toBe("allow");
    expect(ev.status).toBe(200);
    expect(ev.requestId).toBe("req-1");
    expect(typeof ev.latencyMs).toBe("number");
  });

  it("marks 401/403 responses as deny", async () => {
    const { logger, lines } = captureLogger();
    const app = express();
    app.use(auditLogMiddleware({ enabled: true, parentLogger: logger }));
    app.get("/forbidden", (_req, res) => res.status(403).json({ error: "nope" }));

    await request(app).get("/forbidden");

    const auditEvents = lines.filter((l) => l.name === "audit");
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0].decision).toBe("deny");
    expect(auditEvents[0].status).toBe(403);
  });

  it("emits nothing when disabled", async () => {
    const { logger, lines } = captureLogger();
    const app = express();
    app.use(auditLogMiddleware({ enabled: false, parentLogger: logger }));
    app.get("/hello", (_req, res) => res.json({ ok: true }));

    await request(app).get("/hello");

    const auditEvents = lines.filter((l) => l.name === "audit");
    expect(auditEvents).toHaveLength(0);
  });
});
