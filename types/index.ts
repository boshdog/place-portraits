export type PreviewStatus =
  | "pending"
  | "generating"
  | "ready"
  | "failed"
  | "revision_requested"
  | "ordered"
  | "fulfilled"
  | "cancelled";

export type QualityStatus = "approved" | "needs_edit" | "failed";

export type ArtStyle =
  | "classic_watercolour"
  | "elegant_line_wash"
  | "signature_illustrated";

export type OrderStatus =
  | "created"
  | "paid"
  | "processing"
  | "fulfilled"
  | "cancelled";

export interface PreviewRequest {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  original_image_url: string;
  original_image_storage_path: string | null;
  maps_link: string | null;
  style: ArtStyle;
  customer_notes: string | null;
  consent_marketing: boolean;
  expectation_confirmed: boolean;
  status: PreviewStatus;
  preview_token: string;
  generated_preview_url: string | null;
  generated_preview_storage_path: string | null;
  generated_final_url: string | null;
  generated_final_storage_path: string | null;
  generation_provider: string | null;
  generation_model: string | null;
  generation_started_at: string | null;
  generation_completed_at: string | null;
  generation_error: string | null;
  quality_status: QualityStatus | null;
  quality_notes: string | null;
  admin_notes: string | null;
  revision_notes: string | null;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  preview_request_id: string;
  customer_email: string;
  product_key: string;
  product_name: string;
  product_price: number;
  currency: string;
  status: OrderStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  shipping_name: string | null;
  shipping_address_json: Record<string, unknown> | null;
}

export interface Product {
  key: string;
  name: string;
  description: string;
  pricePence: number;
  badge?: string;
  category: "digital" | "print" | "framed";
}
