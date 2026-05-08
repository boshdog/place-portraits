/**
 * Lightweight analytics event helper.
 *
 * TODO: Replace console calls with real tracking (Meta Pixel, GA4, PostHog, etc.)
 *       when production analytics are configured.
 */

export type AnalyticsEvent =
  | "view_homepage"
  | "start_preview"
  | "upload_photo"
  | "submit_preview_request"
  | "preview_generated"
  | "preview_failed"
  | "view_ready_preview"
  | "select_product"
  | "checkout_started"
  | "purchase_completed"
  | "revision_requested";

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${event}`, properties ?? "");
  }
  // TODO: send to analytics provider
}
