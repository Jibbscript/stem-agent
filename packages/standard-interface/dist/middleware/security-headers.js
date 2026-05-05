export function securityHeadersMiddleware(config = {}) {
    const csp = config.contentSecurityPolicy ?? "default-src 'none'; frame-ancestors 'none'";
    const hstsMaxAge = config.hstsMaxAge ?? 31_536_000; // 1 year
    const referrerPolicy = config.referrerPolicy ?? "no-referrer";
    return (_req, res, next) => {
        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Referrer-Policy", referrerPolicy);
        res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        if (hstsMaxAge > 0) {
            res.setHeader("Strict-Transport-Security", `max-age=${hstsMaxAge}; includeSubDomains`);
        }
        // Remove the default Express "X-Powered-By" — tiny info leak.
        res.removeHeader("X-Powered-By");
        next();
    };
}
//# sourceMappingURL=security-headers.js.map