"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  error?: string;
  preview?: string | null;
}

export function ImageUpload({ onFileSelect, error, preview }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please upload a JPG, PNG or WebP image.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "Image must be under 15 MB.";
    }
    return null;
  }

  function handleFile(file: File) {
    const err = validate(file);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    onFileSelect(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const displayError = localError ?? error;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[#1c1a17]">
        House photo{" "}
        <span className="text-red-600" aria-hidden>
          *
        </span>
      </label>

      {/* Upload area */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={clsx(
          "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed p-6 text-center transition-colors",
          dragOver
            ? "border-[#3d2c1e] bg-[#f5f0e8]"
            : "border-[#e5ddd0] bg-[#faf9f7] hover:border-[#c9a87c]",
          displayError && "border-red-300"
        )}
      >
        {preview ? (
          <div className="relative h-40 w-full">
            <Image
              src={preview}
              alt="Uploaded house photo preview"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <>
            <svg
              className="mb-3 h-8 w-8 text-[#c9a87c]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium text-[#3d2c1e]">
              Upload your house photo
            </p>
            <p className="mt-1 text-xs text-[#8a7968]">
              JPG, PNG or WebP · Max 15 MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleChange}
          className="sr-only"
          aria-label="Upload house photo"
        />
      </div>

      {preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 text-xs text-[#6b4f3a] underline hover:no-underline"
        >
          Change photo
        </button>
      )}

      {/* Upload guidance */}
      <p className="mt-2 text-xs leading-relaxed text-[#8a7968]">
        For best results, upload a clear daylight photo showing the front of the
        property. Try to avoid heavy shadows, parked cars blocking the house, or
        photos where the roofline and windows are hidden.
      </p>

      {displayError && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}
