import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  const tenantId = getTenantId();
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where: { tenantId, status: "ACTIVE" },
      include: { images: true, categories: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where: { tenantId, status: "ACTIVE" } }),
  ]);

  return NextResponse.json({
    data: products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
