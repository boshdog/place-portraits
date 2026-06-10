import { NextResponse } from "next/server";
import { dbGetPreviewByToken, dbUpdatePreview } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const preview = await dbGetPreviewByToken(token);
    if (!preview) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await dbUpdatePreview(preview.id, { status: "revision_requested" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[revision] Error:", err);
    return NextResponse.json({ error: "Failed to submit revision request" }, { status: 500 });
  }
}
