"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { generatePreviewToken } from "@/lib/tokens";
import { generateArtworkPreview } from "@/lib/gemini/generateArtwork";
import { sendPreviewRequestReceived, notifyAdminNewRequest } from "@/lib/email";
import type { ArtStyle } from "@/types";
import { redirect } from "next/navigation";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface CreatePreviewState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createPreviewAction(
  _prev: CreatePreviewState,
  formData: FormData
): Promise<CreatePreviewState> {
  // ── Parse fields ──────────────────────────────────────────────────────────
  const customerName = (formData.get("customer_name") as string | null)?.trim() ?? "";
  const customerEmail = (formData.get("customer_email") as string | null)?.trim().toLowerCase() ?? "";
  const customerPhone = (formData.get("customer_phone") as string | null)?.trim() ?? "";
  const mapsLink = (formData.get("maps_link") as string | null)?.trim() ?? "";
  const style = (formData.get("style") as string | null)?.trim() ?? "";
  const customerNotes = (formData.get("customer_notes") as string | null)?.trim() ?? "";
  const consentMarketing = formData.get("consent_marketing") === "on";
  const expectationConfirmed = formData.get("expectation_confirmed") === "on";
  const photo = formData.get("photo") as File | null;

  // ── Validate ──────────────────────────────────────────────────────────────
  const fieldErrors: Record<string, string> = {};

  if (!customerName) fieldErrors.customer_name = "Please enter your first name.";
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    fieldErrors.customer_email = "Please enter a valid email address.";
  }
  if (!style || !["classic_watercolour", "elegant_line_wash", "signature_illustrated"].includes(style)) {
    fieldErrors.style = "Please choose an artwork style.";
  }
  if (!expectationConfirmed) {
    fieldErrors.expectation_confirmed = "Please confirm you understand the artwork style.";
  }
  if (!photo || photo.size === 0) {
    fieldErrors.photo = "Please upload a house photo.";
  } else {
    if (!ALLOWED_TYPES.includes(photo.type)) {
      fieldErrors.photo = "Please upload a JPG, PNG or WebP image.";
    } else if (photo.size > MAX_FILE_SIZE) {
      fieldErrors.photo = "Image must be under 15 MB.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = createAdminClient();

  // ── Upload original photo to Supabase Storage ─────────────────────────────
  const photoBuffer = Buffer.from(await photo!.arrayBuffer());
  const ext = photo!.type.split("/")[1] ?? "jpg";
  const token = generatePreviewToken();
  const storagePath = `uploads/${token}/original.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("house-uploads")
    .upload(storagePath, photoBuffer, {
      contentType: photo!.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[create] Storage upload failed:", uploadError.message);
    return { error: "We couldn't upload your photo. Please try again." };
  }

  // Build a signed URL (1 hour) for the Gemini call; store it temporarily
  const { data: signedUrlData } = await supabase.storage
    .from("house-uploads")
    .createSignedUrl(storagePath, 3600);

  const originalImageUrl = signedUrlData?.signedUrl ?? "";

  // ── Create preview_request record ────────────────────────────────────────
  const { data: requestData, error: insertError } = await supabase
    .from("preview_requests")
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      original_image_url: originalImageUrl,
      original_image_storage_path: storagePath,
      maps_link: mapsLink || null,
      style,
      customer_notes: customerNotes || null,
      consent_marketing: consentMarketing,
      expectation_confirmed: expectationConfirmed,
      status: "generating",
      preview_token: token,
      generation_started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !requestData) {
    console.error("[create] DB insert failed:", insertError?.message);
    return { error: "Something went wrong. Please try again." };
  }

  const requestId = requestData.id;

  // ── Send receipt email (non-blocking) ─────────────────────────────────────
  void sendPreviewRequestReceived({ customerName, customerEmail });
  void notifyAdminNewRequest({ customerName, customerEmail, requestId });

  // ── Trigger generation ────────────────────────────────────────────────────
  // For MVP: synchronous generation. The page will show a generating state
  // and poll for completion. If generation is slow, the customer can
  // return via the preview link in their email.
  // TODO: Move to a background job queue for production.
  void (async () => {
    const result = await generateArtworkPreview({
      previewRequestId: requestId,
      originalImageUrl,
      originalImageStoragePath: storagePath,
      style: style as ArtStyle,
      customerNotes: customerNotes || undefined,
    });

    if (result.success && result.generatedImageUrl) {
      await supabase
        .from("preview_requests")
        .update({
          status: "ready",
          generated_preview_url: result.generatedImageUrl,
          generated_preview_storage_path: result.generatedImageStoragePath ?? null,
          generation_provider: result.provider ?? null,
          generation_model: result.model ?? null,
          generation_completed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    } else {
      await supabase
        .from("preview_requests")
        .update({
          status: "failed",
          generation_error: result.error ?? "Unknown error",
          generation_completed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    }
  })();

  // ── Redirect to preview page ──────────────────────────────────────────────
  redirect(`/preview/${token}`);
}
