import Link from "next/link";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/dashboard/product-table";

export default async function ProductsPage() {
  const tenantId = getTenantId();

  const products = await db.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <Link href="/dashboard/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>
      <ProductTable products={products} />
    </div>
  );
}
