import { PRODUCTS, formatPrice } from "@/lib/products";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function ProductOptionsSection() {
  return (
    <section id="products" className="bg-[#faf9f7] py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
            Product options
          </p>
          <h2 className="text-3xl font-light tracking-tight text-[#1c1a17] md:text-4xl">
            Frame it, print it, or keep it digital
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRODUCTS.map((product) => (
            <div
              key={product.key}
              className="relative rounded-sm border border-[#e5ddd0] bg-white p-5"
            >
              {product.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-[#3d2c1e] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                  {product.badge}
                </span>
              )}
              <p className="mb-1 text-sm font-medium text-[#1c1a17]">
                {product.name}
              </p>
              <p className="mb-3 text-xs leading-relaxed text-[#6b5e4e]">
                {product.description}
              </p>
              <p className="text-lg font-light text-[#3d2c1e]">
                {formatPrice(product.pricePence)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/create">
            <Button size="lg" variant="primary">
              Create Your Preview
            </Button>
          </Link>
          <p className="mt-3 text-xs text-[#8a7968]">
            Preview before you buy. Only order if you love it.
          </p>
        </div>
      </div>
    </section>
  );
}
