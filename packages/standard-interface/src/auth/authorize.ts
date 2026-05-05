import type { Response, NextFunction, RequestHandler } from "express";
import { AuthenticationError, AuthorizationError } from "@stem-agent/shared";
import type { AuthenticatedRequest } from "./auth-middleware.js";

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
export function requirePermission(permission: string): RequestHandler {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.principal) {
      next(new AuthenticationError("authentication required"));
      return;
    }
    if (!req.principal.permissions?.includes(permission)) {
      next(new AuthorizationError(`missing permission: ${permission}`));
      return;
    }
    next();
  };
}

/**
 * Variant that accepts any of the listed permissions. Useful for endpoints
 * that a few distinct roles can reach (e.g. both `admin:*` and `operator:read`).
 */
export function requireAnyPermission(...permissions: string[]): RequestHandler {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.principal) {
      next(new AuthenticationError("authentication required"));
      return;
    }
    const granted = req.principal.permissions ?? [];
    if (!permissions.some((p) => granted.includes(p))) {
      next(new AuthorizationError(`missing any of: ${permissions.join(", ")}`));
      return;
    }
    next();
  };
}
