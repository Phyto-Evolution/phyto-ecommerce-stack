import Link from "next/link";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";

export default async function HomePage() {
  const tenantId = getTenantId();

  const [products, posts] = await Promise.all([
    db.product.findMany({
      where: { tenantId, status: "ACTIVE" },
      include: { images: { where: { isCover: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.post.findMany({
      where: { tenantId, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-green-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your Plant Shop
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-green-100">
            Discover beautiful, healthy plants for your home and garden.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-green-800 hover:bg-green-50"
          >
            Browse Products
          </Link>
        </div>
      </section>

      {/* Latest Products */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>

          {products.length === 0 ? (
            <p className="mt-6 text-gray-500">No products yet.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => {
                const cover = product.images[0];
                return (
                  <Link
                    key={product.id}
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
                      <p className="mt-1 text-sm font-semibold text-green-800">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Blog */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900">From the Blog</h2>

          {posts.length === 0 ? (
            <p className="mt-6 text-gray-500">No blog posts yet.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  {post.publishedAt && (
                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
