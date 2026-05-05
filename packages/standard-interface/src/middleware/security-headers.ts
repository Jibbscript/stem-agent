import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Opt-in security headers. Hand-rolled (no `helmet` dependency) because the
 * agent's API is JSON-only — we can enforce a strict CSP without browser
 * asset concerns. Adapt or swap in `helmet` if your deployment serves HTML.
 *
 * Enabled by gateway config (`SECURITY_HELMET=true`). Defaults are the set
 * of headers that are always safe for a JSON API; callers can override
 * `contentSecurityPolicy` to relax them for a browser-facing dashboard.
 *
 * References:
 *   - OWASP Secure Headers Project
 *   - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 */
export interface SecurityHeadersConfig {
  /** Override CSP. Default: "default-src 'none'; frame-ancestors 'none'". */
  contentSecurityPolicy?: string;
  /** Override HSTS max-age (seconds). Default: 1 year. Set 0 to disable. */
  hstsMaxAge?: number;
  /** Override Referrer-Policy. Default: "no-referrer". */
  referrerPolicy?: string;
}

export function securityHeadersMiddleware(
  config: SecurityHeadersConfig = {},
): RequestHandler {
  const csp =
    config.contentSecurityPolicy ?? "default-src 'none'; frame-ancestors 'none'";
  const hstsMaxAge = config.hstsMaxAge ?? 31_536_000; // 1 year
  const referrerPolicy = config.referrerPolicy ?? "no-referrer";

  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader("Content-Security-Policy", csp);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", referrerPolicy);
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()",
    );
    if (hstsMaxAge > 0) {
      res.setHeader(
        "Strict-Transport-Security",
        `max-age=${hstsMaxAge}; includeSubDomains`,
      );
    }
    // Remove the default Express "X-Powered-By" — tiny info leak.
    res.removeHeader("X-Powered-By");
    next();
  };
}
