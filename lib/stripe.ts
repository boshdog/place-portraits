import Stripe from "stripe";
import type { Product } from "@/types";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil" as any,
    });
  }
  return _stripe;
}

export async function createCheckoutSession({
  product,
  previewRequestId,
  previewToken,
  customerEmail,
}: {
  product: Product;
  previewRequestId: string;
  previewToken: string;
  customerEmail: string;
}): Promise<{ url: string | null; sessionId: string | null; devMode: boolean }> {
  const stripe = getStripe();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!stripe) {
    // Dev mode — no Stripe configured
    return { url: null, sessionId: null, devMode: true };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: product.pricePence,
          product_data: {
            name: product.name,
            description: product.description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      preview_request_id: previewRequestId,
      product_key: product.key,
    },
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/preview/${previewToken}`,
  });

  return { url: session.url, sessionId: session.id, devMode: false };
}
