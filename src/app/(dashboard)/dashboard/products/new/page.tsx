import { createProduct } from "@/actions/product-actions";
import { ProductForm } from "@/components/dashboard/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Product</h2>
      <ProductForm action={createProduct} />
    </div>
  );
}
