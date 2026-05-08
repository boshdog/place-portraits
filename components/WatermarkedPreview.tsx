"use client";

import Image from "next/image";

interface WatermarkedPreviewProps {
  imageUrl: string;
  altText?: string;
}

export function WatermarkedPreview({
  imageUrl,
  altText = "Personalised home artwork preview",
}: WatermarkedPreviewProps) {
  return (
    <div
      className="relative select-none overflow-hidden rounded-sm shadow-md no-save"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src={imageUrl}
        alt={altText}
        width={800}
        height={600}
        className="w-full object-cover"
        draggable={false}
        priority
      />

      {/* CSS watermark overlay — see globals.css for .watermark-overlay definition.
          TODO: For production, replace with server-side watermarked image
          so the unwatermarked URL is never exposed in the browser. */}
      <div className="watermark-overlay" aria-hidden="true" />

      {/* Brand badge */}
      <div className="absolute bottom-3 left-3 rounded-sm bg-black/40 px-2 py-1 text-[10px] uppercase tracking-widest text-white/80 backdrop-blur-sm">
        Place Portraits · Preview
      </div>
    </div>
  );
}
