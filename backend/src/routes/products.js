import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = Router();

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" }
    });
    return successResponse(res, { data: products });
  } catch (error) {
    console.error("Fetch products error:", error);
    return errorResponse(res, "Failed to retrieve products", 500);
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const { name, category, price, status } = req.body;
    if (!name) {
      return errorResponse(res, "Product name is required", 400);
    }
    if (!category) {
      return errorResponse(res, "Product category is required", 400);
    }
    if (price === undefined || isNaN(Number(price))) {
      return errorResponse(res, "Product price must be a valid number", 400);
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price: Number(price),
        status: status || "Active"
      }
    });

    return successResponse(res, { data: product }, 201);
  } catch (error) {
    console.error("Create product error:", error);
    return errorResponse(res, "Failed to create product", 500);
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, status } = req.body;

    const existingProd = await prisma.product.findUnique({
      where: { id }
    });
    if (!existingProd) {
      return errorResponse(res, "Product not found", 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingProd.name,
        category: category !== undefined ? category : existingProd.category,
        price: price !== undefined ? Number(price) : existingProd.price,
        status: status !== undefined ? status : existingProd.status
      }
    });

    return successResponse(res, { data: updated });
  } catch (error) {
    console.error("Update product error:", error);
    return errorResponse(res, "Failed to update product", 500);
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingProd = await prisma.product.findUnique({
      where: { id }
    });
    if (!existingProd) {
      return errorResponse(res, "Product not found", 404);
    }

    await prisma.product.delete({
      where: { id }
    });

    return successResponse(res, { message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return errorResponse(res, "Failed to delete product", 500);
  }
});

export default router;
