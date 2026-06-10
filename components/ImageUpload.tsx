"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { clsx } from "clsx";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 15 * 1024 * 1024;

interface ImageUploadProps {
  /** The form field name — must be "photo" for the server action. */
  name?: string;
  onFileSelect?: (file: File) => void;
  error?: string;
}

export function ImageUpload({
  name = "photo",
  onFileSelect,
  error,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Please upload a JPG, PNG or WebP image.";
    if (file.size > MAX_SIZE_BYTES) return "Image must be under 15 MB.";
    return null;
  }

  function applyFile(file: File) {
    const err = validate(file);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setHasFile(true);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    onFileSelect?.(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const err = validate(file);
    if (err) { setLocalError(err); return; }

    // Put the dropped file into the real file input so FormData includes it
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;
    applyFile(file);
  }

  const displayError = localError ?? error;

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-[#1c1a17]">
        House photo <span className="text-red-600" aria-hidden>*</span>
      </p>

      {/* Drop / click zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={clsx(
          "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-[#3d2c1e] bg-[#f5f0e8]"
            : "border-[#e5ddd0] bg-[#faf9f7] hover:border-[#c9a87c]",
          displayError && "border-red-300"
        )}
      >
        {preview ? (
          <div className="relative h-40 w-full">
            <Image src={preview} alt="Uploaded house photo preview" fill className="object-contain" />
          </div>
        ) : (
          <>
            <svg className="mb-3 h-8 w-8 text-[#c9a87c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium text-[#3d2c1e]">Upload your house photo</p>
            <p className="mt-1 text-xs text-[#8a7968]">JPG, PNG or WebP · Max 15 MB</p>
          </>
        )}

        {/* This is the real form input — named so FormData includes it automatically */}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleChange}
          className="sr-only"
          aria-label="Upload house photo"
        />
      </div>

      {hasFile && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 text-xs text-[#6b4f3a] underline hover:no-underline"
        >
          Change photo
        </button>
      )}

      <p className="mt-2 text-xs leading-relaxed text-[#8a7968]">
        For best results, upload a clear daylight photo showing the front of the
        property. Avoid heavy shadows, parked cars blocking the house, or photos
        where the roofline and windows are hidden.
      </p>

      {displayError && (
        <p className="mt-1 text-xs text-red-600" role="alert">{displayError}</p>
      )}
    </div>
  );
}
