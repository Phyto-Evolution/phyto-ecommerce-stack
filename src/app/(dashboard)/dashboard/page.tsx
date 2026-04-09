import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { StatsCard } from "@/components/dashboard/stats-card";

export default async function DashboardPage() {
  const tenantId = getTenantId();

  const [productCount, postCount, subscriberCount] = await Promise.all([
    db.product.count({ where: { tenantId } }),
    db.post.count({ where: { tenantId } }),
    db.subscriber.count({ where: { tenantId } }),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Products" value={productCount} subtitle="Total listed products" />
        <StatsCard title="Blog Posts" value={postCount} subtitle="Published and draft posts" />
        <StatsCard title="Subscribers" value={subscriberCount} subtitle="Newsletter subscribers" />
      </div>
    </div>
  );
}
