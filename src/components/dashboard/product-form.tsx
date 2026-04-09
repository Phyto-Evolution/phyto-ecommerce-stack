"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string | null;
  price: { toString(): string };
  salePrice: { toString(): string } | null;
  costPrice: { toString(): string } | null;
  stockQty: number;
  status: string;
  genus: string | null;
  species: string | null;
  cultivar: string | null;
  growthStage: string | null;
}

interface ProductFormProps {
  action: (formData: FormData) => void;
  product?: Product | null;
}

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
];

const growthStageOptions = [
  { value: "", label: "None" },
  { value: "SEEDLING", label: "Seedling" },
  { value: "DEFLASKED", label: "Deflasked" },
  { value: "JUVENILE", label: "Juvenile" },
  { value: "SEMI_MATURE", label: "Semi-Mature" },
  { value: "MATURE", label: "Mature" },
  { value: "SPECIMEN", label: "Specimen" },
];

export function ProductForm({ action, product }: ProductFormProps) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <Input
        label="Name"
        name="name"
        required
        defaultValue={product?.name ?? ""}
        placeholder="e.g. Phalaenopsis amabilis"
      />

      <Textarea
        label="Description"
        name="description"
        required
        defaultValue={product?.description ?? ""}
        placeholder="Describe this product..."
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU"
          name="sku"
          defaultValue={product?.sku ?? ""}
          placeholder="e.g. PHY-001"
        />
        <Select
          label="Status"
          name="status"
          options={statusOptions}
          defaultValue={product?.status ?? "DRAFT"}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Price"
          name="price"
          type="number"
          step="0.01"
          required
          defaultValue={product?.price?.toString() ?? ""}
          placeholder="0.00"
        />
        <Input
          label="Sale Price"
          name="salePrice"
          type="number"
          step="0.01"
          defaultValue={product?.salePrice?.toString() ?? ""}
          placeholder="0.00"
        />
        <Input
          label="Cost Price"
          name="costPrice"
          type="number"
          step="0.01"
          defaultValue={product?.costPrice?.toString() ?? ""}
          placeholder="0.00"
        />
      </div>

      <Input
        label="Stock Quantity"
        name="stockQty"
        type="number"
        defaultValue={product?.stockQty?.toString() ?? "0"}
      />

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Plant Details</h3>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Genus"
            name="genus"
            defaultValue={product?.genus ?? ""}
            placeholder="e.g. Phalaenopsis"
          />
          <Input
            label="Species"
            name="species"
            defaultValue={product?.species ?? ""}
            placeholder="e.g. amabilis"
          />
          <Input
            label="Cultivar"
            name="cultivar"
            defaultValue={product?.cultivar ?? ""}
            placeholder="e.g. Alba"
          />
        </div>

        <div className="mt-4">
          <Select
            label="Growth Stage"
            name="growthStage"
            options={growthStageOptions}
            defaultValue={product?.growthStage ?? ""}
          />
        </div>
      </div>

      <Button type="submit">
        {product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
