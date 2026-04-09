import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { Badge } from "@/components/ui/badge";
import type { GrowthStage } from "@prisma/client";

const growthStageLabels: Record<GrowthStage, string> = {
  SEEDLING: "Seedling",
  DEFLASKED: "Deflasked",
  JUVENILE: "Juvenile",
  SEMI_MATURE: "Semi-Mature",
  MATURE: "Mature",
  SPECIMEN: "Specimen",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenantId = getTenantId();

  const product = await db.product.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const hasSale = product.salePrice !== null;
  const coverImage = product.images.find((i) => i.isCover) ?? product.images[0];

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/products" className="hover:text-gray-700">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Images */}
          <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              {coverImage ? (
                <img
                  src={coverImage.url}
                  alt={coverImage.alt ?? product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square overflow-hidden rounded-md bg-gray-100"
                  >
                    <img
                      src={image.url}
                      alt={image.alt ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {(product.genus || product.species) && (
              <p className="mt-1 text-lg italic text-gray-500">
                {[product.genus, product.species].filter(Boolean).join(" ")}
              </p>
            )}

            {product.cultivar && (
              <p className="mt-1 text-sm text-gray-500">
                Cultivar: {product.cultivar}
              </p>
            )}

            {product.growthStage && (
              <div className="mt-3">
                <Badge variant="info">
                  {growthStageLabels[product.growthStage]}
                </Badge>
              </div>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              {hasSale ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    ${product.salePrice!.toString()}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ${product.price.toString()}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-green-800">
                  ${product.price.toString()}
                </span>
              )}
            </div>

            {product.trackStock && (
              <p className="mt-2 text-sm text-gray-500">
                {product.stockQty > 0
                  ? `${product.stockQty} in stock`
                  : product.allowBackorders
                    ? "Backorder available"
                    : "Out of stock"}
              </p>
            )}

            {product.description && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>
                <p className="mt-2 whitespace-pre-line text-gray-600">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  Variants
                </h2>
                <div className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <span className="text-sm text-gray-700">
                        {variant.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${variant.price.toString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
