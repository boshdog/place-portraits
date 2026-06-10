import { NextResponse } from "next/server";
import { dbGetPreviewByToken, dbUpdatePreview, dbCreateOrder } from "@/lib/data";
import { createCheckoutSession } from "@/lib/stripe";
import { getProduct } from "@/lib/products";

export async function POST(req: Request) {
  try {
    const { productKey, previewToken } = await req.json();
    if (!productKey || !previewToken)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const product = getProduct(productKey);
    if (!product) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

    const preview = await dbGetPreviewByToken(previewToken);
    if (!preview) return NextResponse.json({ error: "Preview not found" }, { status: 404 });

    if (preview.status !== "ready")
      return NextResponse.json({ error: "Preview is not ready for purchase" }, { status: 400 });

    const { url, sessionId, devMode } = await createCheckoutSession({
      product,
      previewRequestId: preview.id,
      previewToken,
      customerEmail: preview.customer_email,
    });

    const order = await dbCreateOrder({
      preview_request_id: preview.id,
      customer_email: preview.customer_email,
      product_key: product.key,
      product_name: product.name,
      product_price: product.pricePence,
      stripe_checkout_session_id: sessionId,
    });

    if (devMode) {
      await dbUpdatePreview(preview.id, { status: "ordered" });
      return NextResponse.json({ devMode: true, orderId: order.id });
    }

    return NextResponse.json({ url, sessionId });
  } catch (err) {
    console.error("[checkout] Error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
