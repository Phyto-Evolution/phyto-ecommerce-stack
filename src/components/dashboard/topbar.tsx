import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function Topbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userName = session?.user?.name ?? "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{userName}</span>
        <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-medium">
          {firstLetter}
        </div>
      </div>
    </header>
  );
}
