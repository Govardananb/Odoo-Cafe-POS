import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { SignupSchema, LoginSchema } from "../validations/auth.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new ADMIN or EMPLOYEE user.
 */
router.post("/signup", async (req, res) => {
  try {
    const validation = SignupSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map(issue => issue.message).join(", ");
      return errorResponse(res, errorMsg, 400);
    }

    const { name, email, password, role } = validation.data;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(res, "A user with this email already exists", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return successResponse(res, {
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 201);
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse(res, "An error occurred during registration", 500);
  }
});

/**
 * POST /api/auth/login
 * Verify user credentials and generate session token.
 */
router.post("/login", async (req, res) => {
  try {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map(issue => issue.message).join(", ");
      return errorResponse(res, errorMsg, 400);
    }

    const { email, password } = validation.data;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "Account is suspended", 403);
    }

    // Verify hashed password match
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Generate JWT
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "An error occurred during login", 500);
  }
});

/**
 * GET /api/auth/me
 * Retrieve profile context for the current authenticated user.
 */
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, "Unauthorized request context", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse(res, "User profile not found", 404);
    }

    if (!user.isActive) {
      return errorResponse(res, "User account is suspended", 403);
    }

    return successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Me profile retrieve error:", error);
    return errorResponse(res, "An error occurred retrieving user profile", 500);
  }
});

/**
 * POST /api/auth/logout
 * Clear HTTP HttpOnly session cookies.
 */
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return successResponse(res, {
    message: "Logged out successfully",
  });
});

export default router;
