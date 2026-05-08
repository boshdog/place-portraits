"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import type { PreviewRequest } from "@/types";
import { getStyleLabel } from "@/lib/styles";
import { Button } from "@/components/ui/Button";

interface AdminRequestDetailProps {
  request: PreviewRequest;
  siteUrl: string;
}

export function AdminRequestDetail({
  request,
  siteUrl,
}: AdminRequestDetailProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [notes, setNotes] = useState(request.admin_notes ?? "");
  const [qualityStatus, setQualityStatus] = useState(
    request.quality_status ?? ""
  );
  const [qualityNotes, setQualityNotes] = useState(
    request.quality_notes ?? ""
  );

  async function callAction(body: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/requests/${request.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      setMessage({ type: "success", text: data.message ?? "Done." });
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("requestId", request.id);
    try {
      const res = await fetch("/api/admin/upload-preview", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setMessage({ type: "success", text: "Preview uploaded." });
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setBusy(false);
    }
  }

  const previewUrl = `${siteUrl}/preview/${request.preview_token}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">
          {request.customer_name}
        </span>
      </div>

      {message && (
        <div
          className={clsx(
            "mb-4 rounded-sm px-4 py-3 text-sm",
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer */}
          <section className="rounded-sm border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Customer
            </h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Name", request.customer_name],
                ["Email", request.customer_email],
                ["Phone", request.customer_phone ?? "—"],
                ["Style", getStyleLabel(request.style)],
                ["Status", request.status],
                ["Token", request.preview_token],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-gray-400">{k}</dt>
                  <dd className="font-medium text-gray-800">{v}</dd>
                </div>
              ))}
            </dl>
            {request.maps_link && (
              <p className="mt-3 text-xs">
                <a
                  href={request.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Google Maps link →
                </a>
              </p>
            )}
            {request.customer_notes && (
              <p className="mt-3 rounded-sm bg-gray-50 p-3 text-xs text-gray-700">
                <strong>Notes:</strong> {request.customer_notes}
              </p>
            )}
            <p className="mt-3 text-xs">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View public preview →
              </a>
            </p>
          </section>

          {/* Images */}
          <section className="rounded-sm border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Images
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-gray-400">Original photo</p>
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
                  {request.original_image_url ? (
                    <Image
                      src={request.original_image_url}
                      alt="Original house photo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-gray-400">
                      No image
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-400">Generated preview</p>
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
                  {request.generated_preview_url ? (
                    <Image
                      src={request.generated_preview_url}
                      alt="Generated artwork preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-gray-400">
                      Not generated
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Generation info */}
          <section className="rounded-sm border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Generation
            </h2>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["Provider", request.generation_provider ?? "—"],
                ["Model", request.generation_model ?? "—"],
                ["Started", request.generation_started_at ? new Date(request.generation_started_at).toLocaleString() : "—"],
                ["Completed", request.generation_completed_at ? new Date(request.generation_completed_at).toLocaleString() : "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-gray-400">{k}</dt>
                  <dd className="text-gray-800">{v}</dd>
                </div>
              ))}
            </dl>
            {request.generation_error && (
              <div className="mt-3 rounded-sm bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700">
                  Generation error (admin only):
                </p>
                <p className="mt-1 font-mono text-xs text-red-600 break-all">
                  {request.generation_error}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right column — actions */}
        <div className="space-y-4">
          {/* Actions */}
          <section className="rounded-sm border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Actions
            </h2>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="primary"
                loading={busy}
                onClick={() => callAction({ action: "retry_generation" })}
              >
                Retry generation
              </Button>

              <label className={clsx(
                "flex cursor-pointer items-center justify-center rounded-sm border px-3 py-1.5 text-xs font-medium transition-all",
                busy
                  ? "cursor-not-allowed opacity-50 border-gray-200 text-gray-400"
                  : "border-[#3d2c1e] text-[#3d2c1e] hover:bg-[#3d2c1e] hover:text-white"
              )}>
                Upload replacement preview
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="sr-only"
                  disabled={busy}
                />
              </label>

              <Button
                size="sm"
                variant="secondary"
                loading={busy}
                onClick={() => callAction({ action: "mark_ready" })}
              >
                Mark as ready
              </Button>

              <Button
                size="sm"
                variant="secondary"
                loading={busy}
                onClick={() => callAction({ action: "send_ready_email" })}
              >
                Send ready email
              </Button>

              <div className="my-1 border-t border-gray-100" />

              {(
                [
                  { action: "mark_ordered", label: "Mark as ordered" },
                  { action: "mark_fulfilled", label: "Mark as fulfilled" },
                  { action: "mark_revision_requested", label: "Mark revision requested" },
                  { action: "mark_cancelled", label: "Mark as cancelled" },
                ] as const
              ).map(({ action, label }) => (
                <Button
                  key={action}
                  size="sm"
                  variant="ghost"
                  loading={busy}
                  onClick={() => callAction({ action })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </section>

          {/* Quality status */}
          <section className="rounded-sm border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Quality check
            </h2>
            <select
              value={qualityStatus}
              onChange={(e) => setQualityStatus(e.target.value)}
              className="mb-2 w-full rounded-sm border border-gray-300 px-3 py-2 text-xs"
            >
              <option value="">Not reviewed</option>
              <option value="approved">Approved</option>
              <option value="needs_edit">Needs edit</option>
              <option value="failed">Failed</option>
            </select>
            <textarea
              value={qualityNotes}
              onChange={(e) => setQualityNotes(e.target.value)}
              placeholder="Quality notes..."
              className="mb-2 w-full rounded-sm border border-gray-300 px-3 py-2 text-xs"
              rows={2}
            />
            <Button
              size="sm"
              variant="secondary"
              loading={busy}
              onClick={() =>
                callAction({
                  action: "save_quality",
                  quality_status: qualityStatus,
                  quality_notes: qualityNotes,
                })
              }
            >
              Save quality status
            </Button>
          </section>

          {/* Admin notes */}
          <section className="rounded-sm border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Internal notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal admin notes..."
              className="mb-2 w-full rounded-sm border border-gray-300 px-3 py-2 text-xs"
              rows={4}
            />
            <Button
              size="sm"
              variant="secondary"
              loading={busy}
              onClick={() =>
                callAction({ action: "save_notes", admin_notes: notes })
              }
            >
              Save notes
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
