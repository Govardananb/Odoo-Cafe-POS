import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" }
    });
    return successResponse(res, { data: categories });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return errorResponse(res, "Failed to retrieve categories", 500);
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  try {
    const { name, description, color, status } = req.body;
    if (!name) {
      return errorResponse(res, "Category name is required", 400);
    }

    const existing = await prisma.category.findUnique({
      where: { name }
    });
    if (existing) {
      return errorResponse(res, "A category with this name already exists", 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color: color || "#FF6B1A",
        status: status || "Active"
      }
    });

    return successResponse(res, { data: category }, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return errorResponse(res, "Failed to create category", 500);
  }
});

// PUT /api/categories/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, status } = req.body;

    const existingCat = await prisma.category.findUnique({
      where: { id }
    });
    if (!existingCat) {
      return errorResponse(res, "Category not found", 404);
    }

    if (name && name !== existingCat.name) {
      const nameCheck = await prisma.category.findUnique({
        where: { name }
      });
      if (nameCheck) {
        return errorResponse(res, "A category with this name already exists", 400);
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingCat.name,
        description: description !== undefined ? description : existingCat.description,
        color: color !== undefined ? color : existingCat.color,
        status: status !== undefined ? status : existingCat.status
      }
    });

    return successResponse(res, { data: updated });
  } catch (error) {
    console.error("Update category error:", error);
    return errorResponse(res, "Failed to update category", 500);
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingCat = await prisma.category.findUnique({
      where: { id }
    });
    if (!existingCat) {
      return errorResponse(res, "Category not found", 404);
    }

    await prisma.category.delete({
      where: { id }
    });

    return successResponse(res, { message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    return errorResponse(res, "Failed to delete category", 500);
  }
});

export default router;
