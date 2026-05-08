"use client";

import { useState, useCallback } from "react";
import { PreviewPoller } from "./PreviewPoller";
import { GeneratingState } from "@/components/GeneratingState";
import { WatermarkedPreview } from "@/components/WatermarkedPreview";
import { ProductSelector } from "@/components/ProductSelector";
import { Button } from "@/components/ui/Button";
import type { PreviewRequest, PreviewStatus, Product } from "@/types";
import { getStyleLabel } from "@/lib/styles";
import { getProduct, formatPrice } from "@/lib/products";
import Image from "next/image";

interface PreviewClientProps {
  request: PreviewRequest;
}

export function PreviewClient({ request }: PreviewClientProps) {
  const [status, setStatus] = useState<PreviewStatus>(request.status);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    request.generated_preview_url ?? null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleStatusChange = useCallback(
    (newStatus: PreviewStatus, newUrl: string | null) => {
      setStatus(newStatus);
      if (newUrl) setPreviewUrl(newUrl);
    },
    []
  );

  const handleCheckout = async () => {
    if (!selectedProduct) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productKey: selectedProduct.key,
          previewToken: request.preview_token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.devMode) {
        // Dev mode: redirect to simulated success
        window.location.href = `/checkout/success?dev=true&token=${request.preview_token}&product=${selectedProduct.key}`;
      } else {
        window.location.href = data.url;
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong.");
      setCheckoutLoading(false);
    }
  };

  const isGenerating = status === "pending" || status === "generating";
  const isFailed = status === "failed";
  const isReady = status === "ready" || status === "ordered" || status === "fulfilled";

  return (
    <>
      {/* Poller — only active while generating */}
      <PreviewPoller
        token={request.preview_token}
        currentStatus={status}
        onStatusChange={handleStatusChange}
      />

      {(isGenerating || isFailed) && (
        <GeneratingState
          status={status}
          originalImageUrl={request.original_image_url}
          styleName={getStyleLabel(request.style)}
        />
      )}

      {isReady && previewUrl && (
        <div className="mx-auto max-w-5xl px-6 py-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
              Your personalised home artwork
            </p>
            <h1 className="mb-3 text-3xl font-light tracking-tight text-[#1c1a17]">
              Your artwork preview is ready
            </h1>
            <p className="mx-auto max-w-md text-base text-[#6b5e4e]">
              If you love it, choose your size and finish below. Only printed once
              you&rsquo;ve approved your artwork.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-5">
            {/* Left: artwork */}
            <div className="lg:col-span-3 space-y-4">
              {/* Watermarked preview */}
              <WatermarkedPreview
                imageUrl={previewUrl}
                altText={`Personalised ${getStyleLabel(request.style)} artwork of your home`}
              />

              {/* Style + original photo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-sm border border-[#e5ddd0] bg-white p-3">
                  <p className="mb-0.5 text-[10px] uppercase tracking-widest text-[#8a7968]">
                    Style
                  </p>
                  <p className="text-sm font-medium text-[#1c1a17]">
                    {getStyleLabel(request.style)}
                  </p>
                </div>
                <div className="rounded-sm border border-[#e5ddd0] bg-white p-3">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-[#8a7968]">
                    Original photo
                  </p>
                  <div className="relative h-14 w-full overflow-hidden rounded-sm">
                    <Image
                      src={request.original_image_url}
                      alt="Your original house photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Reassurance */}
              <div className="rounded-sm border border-[#e5ddd0] bg-[#faf6f0] px-4 py-3 text-xs leading-relaxed text-[#6b4f3a]">
                The watermark is removed from your final print. The artwork will
                be professionally prepared for your chosen size.
              </div>
            </div>

            {/* Right: product selection */}
            <div className="lg:col-span-2">
              <ProductSelector
                selectedKey={selectedProduct?.key ?? ""}
                onSelect={setSelectedProduct}
                loading={checkoutLoading}
              />

              {checkoutError && (
                <p className="mt-3 text-xs text-red-600">{checkoutError}</p>
              )}

              <div className="mt-6 space-y-3">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full"
                  disabled={!selectedProduct}
                  loading={checkoutLoading}
                  onClick={handleCheckout}
                >
                  {selectedProduct
                    ? `Order — ${formatPrice(selectedProduct.pricePence)}`
                    : "Choose a size & finish"}
                </Button>

                <button
                  type="button"
                  className="w-full text-center text-xs text-[#8a7968] underline-offset-2 hover:underline"
                  onClick={async () => {
                    const res = await fetch("/api/preview/request-revision", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: request.preview_token }),
                    });
                    if (res.ok) {
                      alert("Thank you — we'll be in touch about your revision request.");
                    }
                  }}
                >
                  Request a small edit
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-[#8a7968]">
                Only printed once you approve. One minor revision included with
                every order.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
