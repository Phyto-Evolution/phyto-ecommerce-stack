"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated");
  }
  if ((session.user as { role?: string }).role !== "OWNER") {
    throw new Error("Not authorized — OWNER role required");
  }
  return session;
}

export async function createProduct(formData: FormData) {
  await requireOwner();
  const tenantId = getTenantId();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sku = (formData.get("sku") as string) || null;
  const priceStr = formData.get("price") as string;
  const salePriceStr = formData.get("salePrice") as string;
  const costPriceStr = formData.get("costPrice") as string;
  const stockQtyStr = formData.get("stockQty") as string;
  const status = (formData.get("status") as string) || "DRAFT";
  const genus = (formData.get("genus") as string) || null;
  const species = (formData.get("species") as string) || null;
  const cultivar = (formData.get("cultivar") as string) || null;
  const growthStage = (formData.get("growthStage") as string) || null;

  const slug = slugify(name);
  const price = new Prisma.Decimal(priceStr);
  const salePrice = salePriceStr ? new Prisma.Decimal(salePriceStr) : null;
  const costPrice = costPriceStr ? new Prisma.Decimal(costPriceStr) : null;
  const stockQty = stockQtyStr ? parseInt(stockQtyStr, 10) : 0;
  const publishedAt = status === "ACTIVE" ? new Date() : null;

  await db.product.create({
    data: {
      tenantId,
      name,
      slug,
      description,
      sku,
      price,
      salePrice,
      costPrice,
      stockQty,
      status: status as "DRAFT" | "ACTIVE" | "ARCHIVED",
      publishedAt,
      genus,
      species,
      cultivar,
      growthStage: growthStage
        ? (growthStage as "SEEDLING" | "DEFLASKED" | "JUVENILE" | "SEMI_MATURE" | "MATURE" | "SPECIMEN")
        : null,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  redirect("/dashboard/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireOwner();
  const tenantId = getTenantId();

  const existing = await db.product.findFirst({
    where: { id, tenantId },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sku = (formData.get("sku") as string) || null;
  const priceStr = formData.get("price") as string;
  const salePriceStr = formData.get("salePrice") as string;
  const costPriceStr = formData.get("costPrice") as string;
  const stockQtyStr = formData.get("stockQty") as string;
  const status = (formData.get("status") as string) || "DRAFT";
  const genus = (formData.get("genus") as string) || null;
  const species = (formData.get("species") as string) || null;
  const cultivar = (formData.get("cultivar") as string) || null;
  const growthStage = (formData.get("growthStage") as string) || null;

  const slug = slugify(name);
  const price = new Prisma.Decimal(priceStr);
  const salePrice = salePriceStr ? new Prisma.Decimal(salePriceStr) : null;
  const costPrice = costPriceStr ? new Prisma.Decimal(costPriceStr) : null;
  const stockQty = stockQtyStr ? parseInt(stockQtyStr, 10) : 0;

  // Preserve existing publishedAt if already set; otherwise set if now ACTIVE
  let publishedAt = existing.publishedAt;
  if (!publishedAt && status === "ACTIVE") {
    publishedAt = new Date();
  }

  await db.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      sku,
      price,
      salePrice,
      costPrice,
      stockQty,
      status: status as "DRAFT" | "ACTIVE" | "ARCHIVED",
      publishedAt,
      genus,
      species,
      cultivar,
      growthStage: growthStage
        ? (growthStage as "SEEDLING" | "DEFLASKED" | "JUVENILE" | "SEMI_MATURE" | "MATURE" | "SPECIMEN")
        : null,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  redirect("/dashboard/products");
}

export async function deleteProduct(id: string) {
  await requireOwner();
  const tenantId = getTenantId();

  await db.product.deleteMany({
    where: { id, tenantId },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
}
