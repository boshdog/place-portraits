import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("preview_requests")
    .select("status, generated_preview_url, updated_at")
    .eq("preview_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: data.status,
    generatedPreviewUrl: data.generated_preview_url ?? null,
    updatedAt: data.updated_at,
  });
}
