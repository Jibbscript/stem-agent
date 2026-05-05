import type { RequestHandler } from "express";
/**
 * Build a middleware that 401s if the request is unauthenticated, and 403s if
 * the authenticated principal lacks the required permission.
 *
 * Example (opt-in, wire it where you need it):
 *
 * ```ts
 * import { requirePermission } from "./auth/index.js";
 * router.post("/admin/something", requirePermission("admin:write"), handler);
 * ```
 *
 * The authenticating middleware (`AuthMiddleware`) must have run earlier in
 * the chain so that `req.principal` is populated. Permissions come from the
 * Principal shape in `shared/src/types/security.ts`.
 */
export declare function requirePermission(permission: string): RequestHandler;
/**
 * Variant that accepts any of the listed permissions. Useful for endpoints
 * that a few distinct roles can reach (e.g. both `admin:*` and `operator:read`).
 */
export declare function requireAnyPermission(...permissions: string[]): RequestHandler;
//# sourceMappingURL=authorize.d.ts.map