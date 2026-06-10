import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { dbGetPreviewById, dbUpdatePreview, dbGetOrderBySessionId, dbUpdateOrderBySessionId } from "@/lib/data";
import { sendOrderConfirmation } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      payment_intent?: string;
      metadata?: { preview_request_id?: string };
      customer_details?: { name?: string; email?: string };
      shipping_details?: { name?: string; address?: Record<string, unknown> };
    };

    const previewRequestId = session.metadata?.preview_request_id;

    if (previewRequestId) {
      await dbUpdateOrderBySessionId(session.id, {
        status: "paid",
        stripe_payment_intent_id: session.payment_intent ?? null,
        shipping_name: session.shipping_details?.name ?? session.customer_details?.name ?? null,
        shipping_address_json: session.shipping_details?.address ?? null,
      });

      await dbUpdatePreview(previewRequestId, { status: "ordered" });

      const orderData = await dbGetOrderBySessionId(session.id);
      const previewReq = await dbGetPreviewById(previewRequestId);

      if (orderData && previewReq && session.customer_details?.email) {
        void sendOrderConfirmation({
          customerName: previewReq.customer_name,
          customerEmail: session.customer_details.email,
          productName: orderData.product_name,
          previewToken: previewReq.preview_token,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
