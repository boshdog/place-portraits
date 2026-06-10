"use server";

import { generatePreviewToken } from "@/lib/tokens";
import { generateArtworkPreview } from "@/lib/gemini/generateArtwork";
import { sendPreviewRequestReceived, notifyAdminNewRequest } from "@/lib/email";
import { devStore } from "@/lib/dev-store";
import { dbUpdatePreview } from "@/lib/data";
import type { ArtStyle } from "@/types";
import { redirect } from "next/navigation";
import { after } from "next/server";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface CreatePreviewState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function isSupabaseReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function createPreviewAction(
  _prev: CreatePreviewState,
  formData: FormData
): Promise<CreatePreviewState> {
  // ── Parse ─────────────────────────────────────────────────────────────────
  const customerName        = (formData.get("customer_name")  as string | null)?.trim() ?? "";
  const customerEmail       = (formData.get("customer_email") as string | null)?.trim().toLowerCase() ?? "";
  const customerPhone       = (formData.get("customer_phone") as string | null)?.trim() ?? "";
  const mapsLink            = (formData.get("maps_link")      as string | null)?.trim() ?? "";
  const style               = (formData.get("style")          as string | null)?.trim() ?? "";
  const customerNotes       = (formData.get("customer_notes") as string | null)?.trim() ?? "";
  const consentMarketing    = formData.get("consent_marketing")    === "on";
  const expectationConfirmed = formData.get("expectation_confirmed") === "on";
  const photo               = formData.get("photo") as File | null;

  // ── Validate ──────────────────────────────────────────────────────────────
  const fieldErrors: Record<string, string> = {};
  if (!customerName) fieldErrors.customer_name = "Please enter your first name.";
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    fieldErrors.customer_email = "Please enter a valid email address.";
  if (!style || !["classic_watercolour", "elegant_line_wash", "signature_illustrated"].includes(style))
    fieldErrors.style = "Please choose an artwork style.";
  if (!expectationConfirmed)
    fieldErrors.expectation_confirmed = "Please confirm you understand the artwork style.";
  if (!photo || photo.size === 0)
    fieldErrors.photo = "Please upload a house photo.";
  else if (!ALLOWED_TYPES.includes(photo.type))
    fieldErrors.photo = "Please upload a JPG, PNG or WebP image.";
  else if (photo.size > MAX_FILE_SIZE)
    fieldErrors.photo = "Image must be under 15 MB.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const token = generatePreviewToken();
  const photoBuffer = Buffer.from(await photo!.arrayBuffer());
  const ext = photo!.type.split("/")[1] ?? "jpg";
  const storagePath = `uploads/${token}/original.${ext}`;
  let requestId: string;
  let originalImageUrl: string;

  if (!isSupabaseReady()) {
    // ── Dev mode: in-memory store ────────────────────────────────────────────
    devStore.storePhoto(token, photoBuffer, photo!.type);
    originalImageUrl = `/api/dev/photo/${token}`;

    const req = devStore.createRequest({
      customer_name:              customerName,
      customer_email:             customerEmail,
      customer_phone:             customerPhone || null,
      original_image_url:         originalImageUrl,
      original_image_storage_path: storagePath,
      maps_link:                  mapsLink || null,
      style:                      style as ArtStyle,
      customer_notes:             customerNotes || null,
      consent_marketing:          consentMarketing,
      expectation_confirmed:      expectationConfirmed,
      status:                     "generating",
      preview_token:              token,
      generated_preview_url:      null,
      generated_preview_storage_path: null,
      generated_final_url:        null,
      generated_final_storage_path: null,
      generation_provider:        null,
      generation_model:           null,
      generation_started_at:      new Date().toISOString(),
      generation_completed_at:    null,
      generation_error:           null,
      quality_status:             null,
      quality_notes:              null,
      admin_notes:                null,
      revision_notes:             null,
    });
    requestId = req.id;
  } else {
    // ── Production: Supabase ─────────────────────────────────────────────────
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from("house-uploads")
      .upload(storagePath, photoBuffer, { contentType: photo!.type, upsert: false });

    if (uploadError) {
      console.error("[create] Storage upload failed:", uploadError.message);
      return { error: "We couldn't upload your photo. Please try again." };
    }

    const { data: signedUrlData } = await supabase.storage
      .from("house-uploads")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7-day signed URL

    originalImageUrl = signedUrlData?.signedUrl ?? "";

    const { data: requestData, error: insertError } = await supabase
      .from("preview_requests")
      .insert({
        customer_name: customerName, customer_email: customerEmail,
        customer_phone: customerPhone || null, original_image_url: originalImageUrl,
        original_image_storage_path: storagePath, maps_link: mapsLink || null,
        style, customer_notes: customerNotes || null,
        consent_marketing: consentMarketing, expectation_confirmed: expectationConfirmed,
        status: "generating", preview_token: token,
        generation_started_at: new Date().toISOString(),
      })
      .select("id").single();

    if (insertError || !requestData) {
      console.error("[create] DB insert failed:", insertError?.message);
      return { error: "Something went wrong saving your request. Please try again." };
    }
    requestId = requestData.id;
  }

  // ── Schedule post-response work ───────────────────────────────────────────
  after(async () => {
    await Promise.allSettled([
      sendPreviewRequestReceived({ customerName, customerEmail }),
      notifyAdminNewRequest({ customerName, customerEmail, requestId }),
    ]);

    const result = await generateArtworkPreview({
      previewRequestId: requestId,
      originalImageUrl,
      originalImageStoragePath: storagePath,
      style: style as ArtStyle,
      customerNotes: customerNotes || undefined,
    });

    if (result.success && result.generatedImageUrl) {
      await dbUpdatePreview(requestId, {
        status: "ready",
        generated_preview_url: result.generatedImageUrl,
        generated_preview_storage_path: result.generatedImageStoragePath ?? null,
        generation_provider: result.provider ?? null,
        generation_model: result.model ?? null,
        generation_completed_at: new Date().toISOString(),
      });
    } else {
      await dbUpdatePreview(requestId, {
        status: "failed",
        generation_error: result.error ?? "Unknown error",
        generation_completed_at: new Date().toISOString(),
      });
    }
  });

  redirect(`/preview/${token}`);
}
