import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { Badge } from "@/components/ui/badge";

export default async function SubscribersPage() {
  const tenantId = getTenantId();
  const subscribers = await db.subscriber.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>

      {subscribers.length === 0 ? (
        <p className="text-gray-500">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {subscriber.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge
                      variant={subscriber.confirmed ? "default" : "secondary"}
                    >
                      {subscriber.confirmed ? "Confirmed" : "Pending"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {subscriber.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
