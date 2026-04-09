import Link from "next/link";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";

export default async function BlogPage() {
  const tenantId = getTenantId();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canWrite = role === "OWNER" || role === "BUYER";

  const posts = await db.post.findMany({
    where: { tenantId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        {canWrite && (
          <Link href="/blog/new">
            <Button size="sm">Write a Post</Button>
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-gray-200 pb-6">
              <Link
                href={`/blog/${post.slug}`}
                className="text-xl font-semibold text-gray-900 hover:text-green-700 transition-colors"
              >
                {post.title}
              </Link>
              {post.publishedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  {post.publishedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
              <p className="text-gray-700 mt-2 leading-relaxed">
                {post.body.slice(0, 300)}
                {post.body.length > 300 ? "..." : ""}
              </p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
