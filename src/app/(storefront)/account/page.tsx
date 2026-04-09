import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
      <Card>
        <CardTitle>Profile</CardTitle>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-medium">{session.user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium">{session.user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Role</span>
            <Badge>{session.user.role as string}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
