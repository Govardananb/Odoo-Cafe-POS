import { verifyToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/response.js";

/**
 * Middleware to authenticate requests via JWT tokens.
 * Extracts token from Authorization header (Bearer scheme) or HttpOnly cookies.
 */
export function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

    // Fallback to cookie if cookie-parser is configured and header is missing
    if (!token && req.cookies) {
      token = req.cookies.token || null;
    }

    if (!token) {
      return errorResponse(res, "Authentication required", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return errorResponse(res, "Invalid or expired authentication session", 401);
    }

    // Attach decoded user information to the request context
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Middleware error:", error);
    return errorResponse(res, "Internal authorization error", 500);
  }
}
