import { NextResponse } from "next/server";
import { dbGetPreviewByToken } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const data = await dbGetPreviewByToken(token);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    status: data.status,
    generatedPreviewUrl: data.generated_preview_url ?? null,
    updatedAt: data.updated_at,
  });
}
