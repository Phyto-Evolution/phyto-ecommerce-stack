import type { Product, ProductImage } from "@prisma/client";
import { ProductCard } from "./product-card";

type ProductWithImages = Product & { images: ProductImage[] };

export function ProductGrid({ products }: { products: ProductWithImages[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">No products available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
