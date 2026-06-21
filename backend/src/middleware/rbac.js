import { errorResponse } from "../utils/response.js";

/**
 * Middleware factory to authorize specific roles.
 * @param allowedRoles Array of authorized user roles
 */
export function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Authentication credentials not found", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, "Access forbidden: Insufficient permissions", 403);
    }

    next();
  };
}

/**
 * Middleware shortcut for admin-only endpoints.
 */
export const requireAdmin = authorizeRoles(["ADMIN"]);
