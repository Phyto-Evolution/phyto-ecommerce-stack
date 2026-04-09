import { config } from "dotenv";
import path from "node:path";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: path.join(__dirname, "..", ".env") });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenantId = "default";

  // Seed store settings
  const settings = [
    { key: "storeName", value: "PhytoCommerce Demo" },
    { key: "storeDescription", value: "A demo plant store" },
    { key: "currency", value: "INR" },
    { key: "timezone", value: "Asia/Kolkata" },
  ];
  for (const s of settings) {
    await prisma.storeSetting.upsert({
      where: { tenantId_key: { tenantId, key: s.key } },
      create: { tenantId, key: s.key, value: s.value },
      update: {},
    });
  }

  // Seed categories
  const categories = [
    { name: "Aroids", slug: "aroids", description: "Monstera, Philodendron, Anthurium and more" },
    { name: "Succulents", slug: "succulents", description: "Drought-tolerant beauties" },
    { name: "Orchids", slug: "orchids", description: "Elegant flowering plants" },
    { name: "Carnivorous", slug: "carnivorous", description: "Bug-eating plants" },
    { name: "Cacti", slug: "cacti", description: "Desert dwellers" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { tenantId_slug: { tenantId, slug: cat.slug } },
      create: { tenantId, ...cat },
      update: {},
    });
  }

  // Seed 3 sample products
  const aroids = await prisma.category.findUnique({ where: { tenantId_slug: { tenantId, slug: "aroids" } } });
  const products = [
    { name: "Monstera Deliciosa", slug: "monstera-deliciosa", description: "The classic Swiss Cheese Plant.", price: 899, stockQty: 25, genus: "Monstera", species: "deliciosa", growthStage: "JUVENILE" as const, status: "ACTIVE" as const, publishedAt: new Date() },
    { name: "Philodendron Pink Princess", slug: "philodendron-pink-princess", description: "Stunning variegated Philodendron.", price: 2499, salePrice: 1999, stockQty: 5, genus: "Philodendron", species: "erubescens", cultivar: "Pink Princess", growthStage: "SEMI_MATURE" as const, status: "ACTIVE" as const, publishedAt: new Date() },
    { name: "Anthurium Clarinervium", slug: "anthurium-clarinervium", description: "Velvet-leaved collector's favorite.", price: 1599, stockQty: 12, genus: "Anthurium", species: "clarinervium", growthStage: "MATURE" as const, status: "ACTIVE" as const, publishedAt: new Date() },
  ];
  for (const prod of products) {
    const product = await prisma.product.upsert({
      where: { tenantId_slug: { tenantId, slug: prod.slug } },
      create: { tenantId, ...prod },
      update: {},
    });
    if (aroids) {
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: product.id, categoryId: aroids.id } },
        create: { productId: product.id, categoryId: aroids.id },
        update: {},
      });
    }
  }

  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
