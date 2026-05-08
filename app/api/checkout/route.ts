import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { getProduct } from "@/lib/products";

export async function POST(req: Request) {
  try {
    const { productKey, previewToken } = await req.json();

    if (!productKey || !previewToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = getProduct(productKey);
    if (!product) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch preview request
    const { data: previewRequest, error: fetchError } = await supabase
      .from("preview_requests")
      .select("id, customer_email, status, preview_token")
      .eq("preview_token", previewToken)
      .single();

    if (fetchError || !previewRequest) {
      return NextResponse.json({ error: "Preview not found" }, { status: 404 });
    }

    if (previewRequest.status !== "ready") {
      return NextResponse.json(
        { error: "Preview is not ready for purchase" },
        { status: 400 }
      );
    }

    // Create Stripe session (or dev-mode stub)
    const { url, sessionId, devMode } = await createCheckoutSession({
      product,
      previewRequestId: previewRequest.id,
      previewToken,
      customerEmail: previewRequest.customer_email,
    });

    // Create order record
    const { data: order } = await supabase
      .from("orders")
      .insert({
        preview_request_id: previewRequest.id,
        customer_email: previewRequest.customer_email,
        product_key: product.key,
        product_name: product.name,
        product_price: product.pricePence,
        currency: "gbp",
        status: devMode ? "created" : "created",
        stripe_checkout_session_id: sessionId ?? null,
      })
      .select("id")
      .single();

    if (devMode) {
      // In dev mode, mark request as ordered immediately
      await supabase
        .from("preview_requests")
        .update({ status: "ordered" })
        .eq("id", previewRequest.id);

      return NextResponse.json({ devMode: true, orderId: order?.id });
    }

    return NextResponse.json({ url, sessionId });
  } catch (err) {
    console.error("[checkout] Error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
