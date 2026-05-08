"use client";

import { useEffect, useCallback } from "react";
import type { PreviewStatus } from "@/types";

interface PreviewPollerProps {
  token: string;
  currentStatus: PreviewStatus;
  onStatusChange: (status: PreviewStatus, imageUrl: string | null) => void;
}

const POLL_INTERVAL_MS = 4000;
const ACTIVE_STATUSES: PreviewStatus[] = ["pending", "generating"];

export function PreviewPoller({
  token,
  currentStatus,
  onStatusChange,
}: PreviewPollerProps) {
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/preview-status/${token}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      onStatusChange(data.status, data.generatedPreviewUrl ?? null);
    } catch {
      // Silently ignore network errors — will retry on next interval
    }
  }, [token, onStatusChange]);

  useEffect(() => {
    if (!ACTIVE_STATUSES.includes(currentStatus)) return;
    const id = setInterval(poll, POLL_INTERVAL_MS);
    // Also poll immediately on mount
    poll();
    return () => clearInterval(id);
  }, [currentStatus, poll]);

  return null;
}
