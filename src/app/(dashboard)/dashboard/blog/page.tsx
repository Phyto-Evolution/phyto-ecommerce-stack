import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { PostTable } from "@/components/dashboard/post-table";

export default async function BlogDashboardPage() {
  const tenantId = getTenantId();

  const posts = await db.post.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = posts.filter((p) => p.status === "PENDING_REVIEW").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
      </div>

      {pendingCount > 0 && (
        <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            {pendingCount} post{pendingCount === 1 ? "" : "s"} pending review.
          </p>
        </div>
      )}

      <PostTable posts={posts} />
    </div>
  );
}
