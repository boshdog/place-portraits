import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetPreviewById, dbUpdatePreview } from "@/lib/data";
import { generateArtworkPreview } from "@/lib/gemini/generateArtwork";
import { sendPreviewReady } from "@/lib/email";
import type { ArtStyle, PreviewStatus } from "@/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  const request = await dbGetPreviewById(id);
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  switch (action) {
    case "retry_generation": {
      await dbUpdatePreview(id, {
        status: "generating",
        generation_error: null,
        generation_started_at: new Date().toISOString(),
        generation_completed_at: null,
      });

      void (async () => {
        const result = await generateArtworkPreview({
          previewRequestId: id,
          originalImageUrl: request.original_image_url,
          originalImageStoragePath: request.original_image_storage_path ?? undefined,
          style: request.style as ArtStyle,
          customerNotes: request.customer_notes ?? undefined,
        });

        if (result.success && result.generatedImageUrl) {
          await dbUpdatePreview(id, {
            status: "ready",
            generated_preview_url: result.generatedImageUrl,
            generated_preview_storage_path: result.generatedImageStoragePath ?? null,
            generation_provider: result.provider ?? null,
            generation_model: result.model ?? null,
            generation_completed_at: new Date().toISOString(),
          });
        } else {
          await dbUpdatePreview(id, {
            status: "failed",
            generation_error: result.error ?? "Unknown error",
            generation_completed_at: new Date().toISOString(),
          });
        }
      })();

      return NextResponse.json({ message: "Generation started." });
    }

    case "mark_ready": {
      await dbUpdatePreview(id, { status: "ready" });
      return NextResponse.json({ message: "Marked as ready." });
    }

    case "send_ready_email": {
      await sendPreviewReady({
        customerName: request.customer_name,
        customerEmail: request.customer_email,
        previewToken: request.preview_token,
      });
      return NextResponse.json({ message: "Ready email sent (or stubbed)." });
    }

    case "mark_ordered":
    case "mark_fulfilled":
    case "mark_revision_requested":
    case "mark_cancelled": {
      const statusMap: Record<string, PreviewStatus> = {
        mark_ordered: "ordered",
        mark_fulfilled: "fulfilled",
        mark_revision_requested: "revision_requested",
        mark_cancelled: "cancelled",
      };
      await dbUpdatePreview(id, { status: statusMap[action] });
      return NextResponse.json({ message: "Status updated." });
    }

    case "save_notes": {
      await dbUpdatePreview(id, { admin_notes: body.admin_notes ?? null });
      return NextResponse.json({ message: "Notes saved." });
    }

    case "save_quality": {
      await dbUpdatePreview(id, {
        quality_status: body.quality_status || null,
        quality_notes: body.quality_notes || null,
      });
      return NextResponse.json({ message: "Quality status saved." });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
