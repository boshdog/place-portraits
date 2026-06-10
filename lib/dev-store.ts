/**
 * In-memory data + file store for development without Supabase.
 *
 * Module-level singletons persist between requests in the Next.js dev server
 * (single Node.js process, modules cached after first load).
 *
 * Resets on: hot-reload triggered by file saves (acceptable in dev).
 * NOT for production use.
 */

import type { PreviewRequest, PreviewStatus } from "@/types";
import { randomUUID } from "crypto";

interface StoredRequest extends PreviewRequest {
  _orderId?: string;
}

interface StoredOrder {
  id: string;
  created_at: string;
  updated_at: string;
  preview_request_id: string;
  customer_email: string;
  product_key: string;
  product_name: string;
  product_price: number;
  currency: string;
  status: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  shipping_name: string | null;
  shipping_address_json: null;
}

// ─── Module-level singletons ──────────────────────────────────────────────────
const requestStore = new Map<string, StoredRequest>();       // keyed by preview_token
const orderStore   = new Map<string, StoredOrder>();         // keyed by order id
const photoStore   = new Map<string, { buf: Buffer; type: string }>(); // keyed by token

// ─── Public API ───────────────────────────────────────────────────────────────
export const devStore = {
  isEnabled(): boolean {
    return (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.DEV_MOCK_GENERATION === "true"
    );
  },

  // ── Requests ────────────────────────────────────────────────────────────────
  createRequest(data: Omit<StoredRequest, "id" | "created_at" | "updated_at">): StoredRequest {
    const now = new Date().toISOString();
    const req: StoredRequest = { id: randomUUID(), created_at: now, updated_at: now, ...data };
    requestStore.set(req.preview_token, req);
    return req;
  },

  getByToken(token: string): StoredRequest | null {
    return requestStore.get(token) ?? null;
  },

  getById(id: string): StoredRequest | null {
    for (const r of requestStore.values()) if (r.id === id) return r;
    return null;
  },

  updateByToken(token: string, patch: Partial<PreviewRequest>): void {
    const r = requestStore.get(token);
    if (r) requestStore.set(token, { ...r, ...patch, updated_at: new Date().toISOString() });
  },

  updateById(id: string, patch: Partial<PreviewRequest>): void {
    for (const [t, r] of requestStore.entries()) {
      if (r.id === id) { requestStore.set(t, { ...r, ...patch, updated_at: new Date().toISOString() }); break; }
    }
  },

  list(status?: PreviewStatus): StoredRequest[] {
    const all = [...requestStore.values()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return status ? all.filter(r => r.status === status) : all;
  },

  // ── Photos ──────────────────────────────────────────────────────────────────
  storePhoto(token: string, buf: Buffer, contentType: string): void {
    photoStore.set(token, { buf, type: contentType });
  },

  getPhoto(token: string): { buf: Buffer; type: string } | null {
    return photoStore.get(token) ?? null;
  },

  // ── Orders ──────────────────────────────────────────────────────────────────
  createOrder(data: Omit<StoredOrder, "id" | "created_at" | "updated_at">): StoredOrder {
    const now = new Date().toISOString();
    const order: StoredOrder = { id: randomUUID(), created_at: now, updated_at: now, ...data };
    orderStore.set(order.id, order);
    return order;
  },

  getOrder(id: string): StoredOrder | null {
    return orderStore.get(id) ?? null;
  },

  getOrderBySessionId(sessionId: string): StoredOrder | null {
    for (const o of orderStore.values()) if (o.stripe_checkout_session_id === sessionId) return o;
    return null;
  },

  updateOrderBySessionId(sessionId: string, patch: Partial<StoredOrder>): void {
    for (const [id, o] of orderStore.entries()) {
      if (o.stripe_checkout_session_id === sessionId) {
        orderStore.set(id, { ...o, ...patch, updated_at: new Date().toISOString() });
        break;
      }
    }
  },
};
