"use client";

import { clsx } from "clsx";
import { PRODUCTS, formatPrice } from "@/lib/products";
import type { Product } from "@/types";

interface ProductSelectorProps {
  selectedKey: string;
  onSelect: (product: Product) => void;
  loading?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  digital: "Digital",
  print: "Fine Art Prints",
  framed: "Framed Prints",
};

export function ProductSelector({
  selectedKey,
  onSelect,
  loading = false,
}: ProductSelectorProps) {
  const categories = ["digital", "print", "framed"] as const;

  return (
    <div>
      <h3 className="mb-1 text-base font-medium text-[#1c1a17]">
        Choose your size &amp; finish
      </h3>
      <p className="mb-6 text-sm text-[#8a7968]">
        All prints are professionally prepared from your artwork.
      </p>

      {categories.map((cat) => {
        const products = PRODUCTS.filter((p) => p.category === cat);
        return (
          <div key={cat} className="mb-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
              {CATEGORY_LABELS[cat]}
            </p>
            <div className="flex flex-col gap-2">
              {products.map((product) => {
                const selected = selectedKey === product.key;
                return (
                  <label
                    key={product.key}
                    className={clsx(
                      "relative flex cursor-pointer items-start gap-4 rounded-sm border p-4 transition-all",
                      selected
                        ? "border-[#3d2c1e] bg-[#faf6f0]"
                        : "border-[#e5ddd0] bg-white hover:border-[#c9a87c]",
                      loading && "pointer-events-none opacity-60"
                    )}
                  >
                    <input
                      type="radio"
                      name="product"
                      value={product.key}
                      checked={selected}
                      onChange={() => onSelect(product)}
                      className="sr-only"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1c1a17]">
                          {product.name}
                        </span>
                        {product.badge && (
                          <span className="rounded-full bg-[#3d2c1e] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <span className="mt-0.5 text-xs text-[#6b5e4e]">
                        {product.description}
                      </span>
                    </div>
                    <span className="shrink-0 text-base font-medium text-[#3d2c1e]">
                      {formatPrice(product.pricePence)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
