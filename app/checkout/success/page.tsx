import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/Button";
import { dbGetOrderBySessionId } from "@/lib/data";
import { getProduct } from "@/lib/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed — Place Portraits",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ session_id?: string; dev?: string; token?: string; product?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isDevMode = params.dev === "true";
  const previewToken = params.token;
  const devProduct = params.product ? getProduct(params.product) : null;

  // For real Stripe: look up the session to confirm
  let productName = devProduct?.name ?? "your artwork";
  if (!isDevMode && params.session_id) {
    try {
      const order = await dbGetOrderBySessionId(params.session_id);
      if (order?.product_name) productName = order.product_name;
    } catch {
      // Non-critical — continue showing generic success
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          {/* Checkmark */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#c9a87c] bg-[#faf6f0]">
            <svg
              className="h-8 w-8 text-[#3d2c1e]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
            Order confirmed
          </p>
          <h1 className="mb-4 text-3xl font-light tracking-tight text-[#1c1a17]">
            Thank you for your order
          </h1>
          <p className="mb-6 text-base leading-relaxed text-[#6b5e4e]">
            We&rsquo;re preparing your <strong>{productName}</strong> for print and
            will email you with updates as we get closer to fulfilment.
          </p>
          <p className="mb-8 text-sm text-[#8a7968]">
            Your personalised home artwork will be professionally prepared and
            dispatched to you. Thank you for choosing Place Portraits.
          </p>

          {isDevMode && (
            <div className="mb-8 rounded-sm border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
              <strong>Dev mode:</strong> This is a simulated checkout success. No real payment was taken.
            </div>
          )}

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {previewToken && (
              <Link href={`/preview/${previewToken}`}>
                <Button size="md" variant="secondary">
                  View your artwork
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button size="md" variant="ghost">
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
