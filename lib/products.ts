import type { Product } from "@/types";

export const PRODUCTS: Product[] = [
  {
    key: "digital_file",
    name: "Digital Artwork File",
    description:
      "Receive the final artwork file, ready to print yourself or keep digitally.",
    pricePence: 2900,
    category: "digital",
  },
  {
    key: "a5_print",
    name: "A5 Fine Art Print",
    description: "A small keepsake print, ideal for gifting.",
    pricePence: 2900,
    category: "print",
  },
  {
    key: "a4_print",
    name: "A4 Fine Art Print",
    description: "A classic size for thoughtful personalised wall art.",
    pricePence: 3900,
    category: "print",
  },
  {
    key: "a3_print",
    name: "A3 Fine Art Print",
    description: "A larger statement print with more presence.",
    pricePence: 5900,
    category: "print",
  },
  {
    key: "a5_framed",
    name: "A5 Framed Keepsake",
    description:
      "A beautifully framed mini portrait for shelves, desks and thoughtful gifts.",
    pricePence: 4900,
    badge: "Best Gift",
    category: "framed",
  },
  {
    key: "a4_framed",
    name: "A4 Framed Fine Art Print",
    description: "Our most popular framed size, perfect for the home.",
    pricePence: 7900,
    badge: "Most Popular",
    category: "framed",
  },
  {
    key: "a3_framed",
    name: "A3 Framed Statement Print",
    description: "A larger framed artwork designed to make an impact.",
    pricePence: 11900,
    badge: "Best Impact",
    category: "framed",
  },
];

export function getProduct(key: string): Product | undefined {
  return PRODUCTS.find((p) => p.key === key);
}

export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`;
}
