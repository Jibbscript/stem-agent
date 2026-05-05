import type { RequestHandler } from "express";
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
export declare function securityHeadersMiddleware(config?: SecurityHeadersConfig): RequestHandler;
//# sourceMappingURL=security-headers.d.ts.map