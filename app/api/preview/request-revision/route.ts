import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("preview_requests")
      .update({ status: "revision_requested" })
      .eq("preview_token", token);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[revision] Error:", err);
    return NextResponse.json({ error: "Failed to submit revision request" }, { status: 500 });
  }
}
