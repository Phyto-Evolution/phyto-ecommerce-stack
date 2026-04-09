import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { updateProduct } from "@/actions/product-actions";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenantId = getTenantId();

  const product = await db.product.findFirst({
    where: { id, tenantId },
  });

  if (!product) {
    notFound();
  }

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h2>
      <ProductForm action={updateWithId} product={product} />
    </div>
  );
}
