import Link from "next/link";
import type { Product, ProductImage, GrowthStage } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const growthStageLabels: Record<GrowthStage, string> = {
  SEEDLING: "Seedling",
  DEFLASKED: "Deflasked",
  JUVENILE: "Juvenile",
  SEMI_MATURE: "Semi-Mature",
  MATURE: "Mature",
  SPECIMEN: "Specimen",
};

type ProductWithImages = Product & { images: ProductImage[] };

export function ProductCard({ product }: { product: ProductWithImages }) {
  const cover = product.images.find((i) => i.isCover) ?? product.images[0];
  const hasSale = product.salePrice !== null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-square bg-gray-100">
        {cover ? (
          <img
            src={cover.url}
            alt={cover.alt ?? product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-800">
          {product.name}
        </h3>

        {(product.genus || product.species) && (
          <p className="mt-0.5 text-xs italic text-gray-500">
            {[product.genus, product.species].filter(Boolean).join(" ")}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {hasSale ? (
            <>
              <span className="text-sm font-semibold text-red-600">
                ${product.salePrice!.toString()}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ${product.price.toString()}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-green-800">
              ${product.price.toString()}
            </span>
          )}
        </div>

        {product.growthStage && (
          <div className="mt-2">
            <Badge variant="info">{growthStageLabels[product.growthStage]}</Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
