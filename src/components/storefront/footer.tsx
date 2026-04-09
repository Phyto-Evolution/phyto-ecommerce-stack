import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">PhytoCommerce</h3>
            <p className="mt-2 text-sm text-gray-600">
              The open-source ecommerce platform for plant retailers. Grow your
              business online with a beautiful storefront.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} PhytoCommerce. MIT License.
        </div>
      </div>
    </footer>
  );
}
