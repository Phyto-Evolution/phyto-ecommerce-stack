"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/actions/product-actions";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: { toString(): string };
  stockQty: number;
  status: string;
  genus: string | null;
  species: string | null;
}

interface ProductTableProps {
  products: Product[];
}

const statusVariant: Record<string, "warning" | "success" | "default"> = {
  DRAFT: "warning",
  ACTIVE: "success",
  ARCHIVED: "default",
};

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>
          No products yet.{" "}
          <Link href="/dashboard/products/new" className="text-green-700 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                {(product.genus || product.species) && (
                  <div className="text-xs text-gray-500 italic">
                    {[product.genus, product.species].filter(Boolean).join(" ")}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.sku ?? "—"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${product.price.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.stockQty}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={statusVariant[product.status] ?? "default"}>
                  {product.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="text-green-700 hover:underline"
                >
                  Edit
                </Link>
                <form
                  className="inline"
                  action={async () => {
                    if (confirm("Are you sure you want to delete this product?")) {
                      await deleteProduct(product.id);
                    }
                  }}
                >
                  <Button type="submit" variant="danger" size="sm">
                    Delete
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
