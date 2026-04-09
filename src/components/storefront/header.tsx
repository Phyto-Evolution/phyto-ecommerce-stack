import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-green-800">
          PhytoCommerce
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
            Blog
          </Link>

          {session ? (
            <>
              <Link href="/account" className="text-sm text-gray-600 hover:text-gray-900">
                Account
              </Link>
              {session.user.role === "OWNER" && (
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
