import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://placeportraits.co.uk";
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/create"], disallow: ["/admin", "/preview/", "/api/", "/checkout/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
