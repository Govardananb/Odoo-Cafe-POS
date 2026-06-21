import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@gmail.com";
  
  // Check if ADMIN already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log(`[SEED] Created default ADMIN account: ${admin.email}`);
  } else {
    console.log(`[SEED] ADMIN account (${adminEmail}) already exists. Skipping.`);
  }

  // Seed Categories
  const categories = [
    { name: "Beverages", description: "Teas, coffees, and soft drinks", color: "#FF6B1A", status: "Active" },
    { name: "Meals", description: "Burgers, sandwiches, and mains", color: "#10B981", status: "Active" },
    { name: "Desserts", description: "Cakes, ice creams, and sweets", color: "#EC4899", status: "Active" },
    { name: "Snacks", description: "Quick bites and appetizers", color: "#F59E0B", status: "Active" }
  ];

  for (const cat of categories) {
    const existingCat = await prisma.category.findUnique({
      where: { name: cat.name },
    });
    if (!existingCat) {
      await prisma.category.create({ data: cat });
      console.log(`[SEED] Created Category: ${cat.name}`);
    }
  }

  // Seed Products
  const products = [
    { name: "Masala Tea", category: "Beverages", price: 20, status: "Active" },
    { name: "Coffee", category: "Beverages", price: 30, status: "Active" },
    { name: "Lassi", category: "Beverages", price: 30, status: "Active" },
    { name: "Cheese Burger", category: "Meals", price: 80, status: "Active" }
  ];

  for (const prod of products) {
    const existingProd = await prisma.product.findFirst({
      where: { name: prod.name, category: prod.category },
    });
    if (!existingProd) {
      await prisma.product.create({ data: prod });
      console.log(`[SEED] Created Product: ${prod.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
