import { NextResponse } from "next/server";
import { devStore } from "@/lib/dev-store";

// Only active when Supabase is not configured — serves in-memory uploaded photos
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { token } = await params;
  const photo = devStore.getPhoto(token);

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(photo.buf.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": photo.type,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
