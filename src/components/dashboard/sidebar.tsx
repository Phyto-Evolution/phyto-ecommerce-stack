"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", emoji: "\ud83d\udcca" },
  { href: "/dashboard/products", label: "Products", emoji: "\ud83c\udf3f" },
  { href: "/dashboard/blog", label: "Blog", emoji: "\ud83d\udcdd" },
  { href: "/dashboard/blog/subscribers", label: "Subscribers", emoji: "\ud83d\udce7" },
  { href: "/dashboard/settings", label: "Settings", emoji: "\u2699\ufe0f" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4 flex flex-col">
      <Link href="/" className="text-green-400 text-xl font-bold mb-8 block">
        PhytoCommerce
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800",
              ].join(" ")}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="text-gray-400 hover:text-white text-sm mt-auto pt-4 border-t border-gray-800 block"
      >
        &larr; Back to Store
      </Link>
    </aside>
  );
}
