/**
 * generateArtworkPreview — the single stable interface the rest of the app uses.
 *
 * This module is the AI provider adapter. The rest of the app must not import
 * from @google/generative-ai directly; it should call generateArtworkPreview().
 *
 * Provider support:
 *   - Gemini / Imagen 3 (when GEMINI_API_KEY is set)
 *   - Dev-mode mock (when GEMINI_API_KEY is absent or DEV_MOCK_GENERATION=true)
 *
 * To switch providers: replace the implementation inside generateWithGemini()
 * and keep the GenerateArtworkInput / GenerateArtworkResult contract unchanged.
 *
 * ─── Gemini Image Generation Notes ───────────────────────────────────────────
 * Imagen 3 (imagen-3.0-generate-001) accepts text prompts only — it does NOT
 * support image-to-image in the standard API. For house artwork, we need
 * image-to-image (i.e. the source house photo must influence the output).
 *
 * Options to evaluate when setting up production:
 *
 * 1. Gemini 2.0 Flash with image generation capability
 *    (gemini-2.0-flash-preview-image-generation) — supports multimodal input
 *    including source images, and can output images. This is the most likely
 *    production path.
 *    Ref: https://ai.google.dev/gemini-api/docs/image-generation
 *
 * 2. Vertex AI Imagen 3 with image editing / style transfer endpoints.
 *    Ref: https://cloud.google.com/vertex-ai/generative-ai/docs/image/edit-images
 *
 * 3. Third-party image generation APIs (Replicate, fal.ai, etc.) —
 *    can be dropped in here behind the same interface.
 *
 * TODO: When your API access is provisioned:
 *   1. Test generateWithGemini() below with a real house photo.
 *   2. Confirm which model supports image-in → image-out.
 *   3. Update the payload construction in generateWithGemini() accordingly.
 *   4. Set GEMINI_IMAGE_MODEL in your .env to the confirmed model name.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { GenerateArtworkInput, GenerateArtworkResult } from "./types";
import { buildPrompt } from "./prompts";
import { isDevMockEnabled } from "./client";
import { createAdminClient } from "@/lib/supabase/server";

const MOCK_PREVIEW_IMAGE_URL =
  "https://placehold.co/800x600/e8d5b7/6b4f3a?text=Preview+Artwork";

// ─── Dev-mode mock ────────────────────────────────────────────────────────────

async function generateMock(
  input: GenerateArtworkInput
): Promise<GenerateArtworkResult> {
  console.log(
    `[mock generation] Returning placeholder image for request ${input.previewRequestId}`
  );
  // Simulate brief processing time in dev
  await new Promise((r) => setTimeout(r, 1200));
  return {
    success: true,
    generatedImageUrl: MOCK_PREVIEW_IMAGE_URL,
    generatedImageStoragePath: undefined,
    provider: "mock",
    model: "dev-mock",
  };
}

// ─── Real Gemini generation ───────────────────────────────────────────────────

async function generateWithGemini(
  input: GenerateArtworkInput
): Promise<GenerateArtworkResult> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model =
    process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.0-flash-preview-image-generation";
  const prompt = buildPrompt(input.style, input.customerNotes);

  try {
    /**
     * TODO: Replace this fetch with the confirmed Gemini image-generation call.
     *
     * Expected approach for gemini-2.0-flash-preview-image-generation:
     *
     * POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
     * {
     *   "contents": [
     *     {
     *       "parts": [
     *         { "text": "<your style prompt>" },
     *         { "inline_data": { "mime_type": "image/jpeg", "data": "<base64>" } }
     *       ]
     *     }
     *   ],
     *   "generationConfig": { "responseModalities": ["TEXT", "IMAGE"] }
     * }
     *
     * The response will include an inline_data part with the generated image bytes.
     * Extract, store to Supabase Storage, and return the public URL.
     */

    // Fetch the original image and convert to base64
    const imageResponse = await fetch(input.originalImageUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch original image: ${imageResponse.status}`
      );
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageArrayBuffer).toString("base64");
    const contentType =
      imageResponse.headers.get("content-type") ?? "image/jpeg";

    // Call Gemini multimodal image generation endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: contentType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
        // TODO: Adjust these when you know the exact model capabilities
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
    }

    const result = await response.json();

    // Extract generated image bytes from response
    const candidates = result?.candidates ?? [];
    const parts = candidates[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inline_data?: { data?: string; mime_type?: string } }) =>
        p.inline_data?.data
    );

    if (!imagePart?.inline_data?.data) {
      throw new Error("No image data in Gemini response");
    }

    const generatedBuffer = Buffer.from(imagePart.inline_data.data, "base64");
    const generatedMimeType = imagePart.inline_data.mime_type ?? "image/png";
    const ext = generatedMimeType.split("/")[1] ?? "png";

    // Store generated image in Supabase Storage (preview-images bucket)
    const supabase = createAdminClient();
    const storagePath = `previews/${input.previewRequestId}/preview.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("preview-images")
      .upload(storagePath, generatedBuffer, {
        contentType: generatedMimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("preview-images")
      .getPublicUrl(storagePath);

    return {
      success: true,
      generatedImageUrl: urlData.publicUrl,
      generatedImageStoragePath: storagePath,
      provider: "gemini",
      model,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[gemini] Generation failed:", message);
    return {
      success: false,
      error: message,
      provider: "gemini",
      model,
    };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * generateArtworkPreview — stable interface for the rest of the app.
 *
 * Always call this function; never call Gemini/provider SDKs directly.
 */
export async function generateArtworkPreview(
  input: GenerateArtworkInput
): Promise<GenerateArtworkResult> {
  if (isDevMockEnabled()) {
    return generateMock(input);
  }
  return generateWithGemini(input);
}
