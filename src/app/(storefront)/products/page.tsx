import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { ProductGrid } from "@/components/storefront/product-grid";

export const metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const tenantId = getTenantId();

  const products = await db.product.findMany({
    where: { tenantId, status: "ACTIVE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
