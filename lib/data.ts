/**
 * Unified data access layer.
 *
 * All app code should import from here — never call createAdminClient()
 * or devStore directly from routes/actions.
 *
 * Automatically uses the dev store when Supabase is not configured.
 */

import { devStore } from "./dev-store";
import type { PreviewRequest, PreviewStatus } from "@/types";

function isSupabaseReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getSupabase() {
  const { createAdminClient } = await import("./supabase/server");
  return createAdminClient();
}

// ─── Preview Requests ─────────────────────────────────────────────────────────

export async function dbGetPreviewByToken(
  token: string
): Promise<PreviewRequest | null> {
  if (!isSupabaseReady()) return devStore.getByToken(token);
  const sb = await getSupabase();
  const { data } = await sb.from("preview_requests").select("*").eq("preview_token", token).single();
  return data ?? null;
}

export async function dbGetPreviewById(id: string): Promise<PreviewRequest | null> {
  if (!isSupabaseReady()) return devStore.getById(id);
  const sb = await getSupabase();
  const { data } = await sb.from("preview_requests").select("*").eq("id", id).single();
  return data ?? null;
}

export async function dbUpdatePreview(
  id: string,
  patch: Partial<PreviewRequest>
): Promise<void> {
  if (!isSupabaseReady()) { devStore.updateById(id, patch); return; }
  const sb = await getSupabase();
  await sb.from("preview_requests").update(patch).eq("id", id);
}

export async function dbListPreviews(
  status?: PreviewStatus,
  limit = 100
): Promise<PreviewRequest[]> {
  if (!isSupabaseReady()) return devStore.list(status).slice(0, limit);
  const sb = await getSupabase();
  let q = sb.from("preview_requests").select("*").order("created_at", { ascending: false }).limit(limit);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return data ?? [];
}

export async function dbCountByStatus(): Promise<Record<string, number>> {
  if (!isSupabaseReady()) {
    return devStore.list().reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});
  }
  const sb = await getSupabase();
  const { data } = await sb.from("preview_requests").select("status");
  return (data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function dbCreateOrder(data: {
  preview_request_id: string;
  customer_email: string;
  product_key: string;
  product_name: string;
  product_price: number;
  stripe_checkout_session_id?: string | null;
}): Promise<{ id: string }> {
  if (!isSupabaseReady()) {
    const o = devStore.createOrder({
      ...data,
      currency: "gbp",
      status: "created",
      stripe_checkout_session_id: data.stripe_checkout_session_id ?? null,
      stripe_payment_intent_id: null,
      shipping_name: null,
      shipping_address_json: null,
    });
    return { id: o.id };
  }
  const sb = await getSupabase();
  const { data: row } = await sb.from("orders").insert({
    ...data,
    currency: "gbp",
    status: "created",
  }).select("id").single();
  return { id: row?.id ?? "" };
}

export async function dbGetOrderBySessionId(sessionId: string): Promise<{ id: string; product_name: string; preview_request_id: string } | null> {
  if (!isSupabaseReady()) {
    const o = devStore.getOrderBySessionId(sessionId);
    return o ? { id: o.id, product_name: o.product_name, preview_request_id: o.preview_request_id } : null;
  }
  const sb = await getSupabase();
  const { data } = await sb.from("orders").select("id, product_name, preview_request_id").eq("stripe_checkout_session_id", sessionId).single();
  return data ?? null;
}

export async function dbUpdateOrderBySessionId(
  sessionId: string,
  patch: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseReady()) { devStore.updateOrderBySessionId(sessionId, patch as never); return; }
  const sb = await getSupabase();
  await sb.from("orders").update(patch).eq("stripe_checkout_session_id", sessionId);
}

// ─── Config check ─────────────────────────────────────────────────────────────

export function getConfigStatus() {
  return {
    supabase: isSupabaseReady(),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    resend: Boolean(process.env.RESEND_API_KEY),
    adminConfigured: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD),
    devMode: !isSupabaseReady() || process.env.DEV_MOCK_GENERATION === "true",
  };
}
