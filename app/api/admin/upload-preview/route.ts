import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbUpdatePreview } from "@/lib/data";

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const requestId = formData.get("requestId") as string | null;

  if (!file || !requestId) {
    return NextResponse.json({ error: "Missing file or requestId" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const isSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  let previewUrl: string;

  if (isSupabase) {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();
    const ext = file.type.split("/")[1] ?? "jpg";
    const storagePath = `previews/${requestId}/manual-preview.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("preview-images")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("preview-images").getPublicUrl(storagePath);
    previewUrl = urlData.publicUrl;

    await dbUpdatePreview(requestId, {
      generated_preview_url: previewUrl,
      generated_preview_storage_path: storagePath,
      generation_provider: "manual",
      generation_model: "admin-upload",
      generation_completed_at: new Date().toISOString(),
    });
  } else {
    // Dev mode: store as data URL
    const buffer = Buffer.from(await file.arrayBuffer());
    previewUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    await dbUpdatePreview(requestId, {
      generated_preview_url: previewUrl,
      generated_preview_storage_path: null,
      generation_provider: "manual",
      generation_model: "admin-upload",
      generation_completed_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ url: previewUrl });
}
