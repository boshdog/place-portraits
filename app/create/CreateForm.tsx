"use client";

import { useActionState, useState, useRef } from "react";
import { createPreviewAction } from "./actions";
import { StyleSelector } from "@/components/StyleSelector";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/Button";
import type { ArtStyle } from "@/types";
import type { CreatePreviewState } from "./actions";

const initialState: CreatePreviewState = {};

export function CreateForm() {
  const [state, action, pending] = useActionState(createPreviewAction, initialState);
  const [style, setStyle] = useState<ArtStyle | "">("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileSelect(file: File) {
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  // Inject the file into FormData manually via a hidden input approach:
  // We use a DataTransfer object to put the file back into a file input.
  // The form submits normally via server action with the file included.

  const fe = state.fieldErrors ?? {};

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-6"
      encType="multipart/form-data"
      noValidate
    >
      {state.error && (
        <div className="rounded-sm bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </div>
      )}

      {/* Name + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="customer_name" className="mb-1 block text-sm font-medium text-[#1c1a17]">
            First name <span className="text-red-600" aria-hidden>*</span>
          </label>
          <input
            id="customer_name"
            name="customer_name"
            type="text"
            autoComplete="given-name"
            required
            className="w-full rounded-sm border border-[#e5ddd0] bg-white px-3 py-2.5 text-sm text-[#1c1a17] focus:border-[#3d2c1e] focus:outline-none focus:ring-1 focus:ring-[#3d2c1e]"
            placeholder="Your first name"
            aria-describedby={fe.customer_name ? "name-error" : undefined}
          />
          {fe.customer_name && (
            <p id="name-error" className="mt-1 text-xs text-red-600">{fe.customer_name}</p>
          )}
        </div>
        <div>
          <label htmlFor="customer_email" className="mb-1 block text-sm font-medium text-[#1c1a17]">
            Email address <span className="text-red-600" aria-hidden>*</span>
          </label>
          <input
            id="customer_email"
            name="customer_email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-sm border border-[#e5ddd0] bg-white px-3 py-2.5 text-sm text-[#1c1a17] focus:border-[#3d2c1e] focus:outline-none focus:ring-1 focus:ring-[#3d2c1e]"
            placeholder="your@email.com"
            aria-describedby={fe.customer_email ? "email-error" : undefined}
          />
          {fe.customer_email && (
            <p id="email-error" className="mt-1 text-xs text-red-600">{fe.customer_email}</p>
          )}
        </div>
      </div>

      {/* Phone (optional) */}
      <div>
        <label htmlFor="customer_phone" className="mb-1 block text-sm font-medium text-[#1c1a17]">
          Phone number <span className="text-[#8a7968] font-normal">(optional)</span>
        </label>
        <input
          id="customer_phone"
          name="customer_phone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-sm border border-[#e5ddd0] bg-white px-3 py-2.5 text-sm text-[#1c1a17] focus:border-[#3d2c1e] focus:outline-none focus:ring-1 focus:ring-[#3d2c1e]"
          placeholder="+44 7700 000000"
        />
      </div>

      {/* Photo upload */}
      <div>
        <ImageUpload
          onFileSelect={handleFileSelect}
          preview={photoPreview}
          error={fe.photo}
        />
        {/* Hidden file input that carries the actual file for the server action */}
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          ref={(el) => {
            // Sync our chosen file into the hidden input via DataTransfer
            if (el && photoFile) {
              const dt = new DataTransfer();
              dt.items.add(photoFile);
              el.files = dt.files;
            }
          }}
          aria-hidden
          tabIndex={-1}
        />
      </div>

      {/* Google Maps link */}
      <div>
        <label htmlFor="maps_link" className="mb-1 block text-sm font-medium text-[#1c1a17]">
          Google Maps / Street View link <span className="text-[#8a7968] font-normal">(optional)</span>
        </label>
        <input
          id="maps_link"
          name="maps_link"
          type="url"
          className="w-full rounded-sm border border-[#e5ddd0] bg-white px-3 py-2.5 text-sm text-[#1c1a17] focus:border-[#3d2c1e] focus:outline-none focus:ring-1 focus:ring-[#3d2c1e]"
          placeholder="https://maps.google.com/..."
        />
        <p className="mt-1 text-xs text-[#8a7968]">
          Helpful if the photo doesn&rsquo;t show the full frontage.
        </p>
      </div>

      {/* Style selector */}
      <div>
        <StyleSelector value={style} onChange={setStyle} error={fe.style} />
        {/* Hidden input to pass style to server action */}
        <input type="hidden" name="style" value={style} />
      </div>

      {/* Customer notes */}
      <div>
        <label htmlFor="customer_notes" className="mb-1 block text-sm font-medium text-[#1c1a17]">
          Anything we should know? <span className="text-[#8a7968] font-normal">(optional)</span>
        </label>
        <textarea
          id="customer_notes"
          name="customer_notes"
          rows={3}
          className="w-full rounded-sm border border-[#e5ddd0] bg-white px-3 py-2.5 text-sm text-[#1c1a17] focus:border-[#3d2c1e] focus:outline-none focus:ring-1 focus:ring-[#3d2c1e]"
          placeholder="e.g. please remove car if possible, keep the blue door, focus on front of house…"
        />
      </div>

      {/* Expectation confirmation */}
      <div className="rounded-sm border border-[#e5ddd0] bg-[#faf6f0] p-4">
        <label className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            name="expectation_confirmed"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#3d2c1e]"
            required
          />
          <span className="text-sm leading-snug text-[#3d2c1e]">
            I understand this will be a beautified artwork based on my photo, not an exact architectural drawing.
          </span>
        </label>
        {fe.expectation_confirmed && (
          <p className="mt-2 text-xs text-red-600">{fe.expectation_confirmed}</p>
        )}
      </div>

      {/* Marketing consent */}
      <div>
        <label className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            name="consent_marketing"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#3d2c1e]"
          />
          <span className="text-sm leading-snug text-[#6b5e4e]">
            Email me about my preview and occasional offers.
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          loading={pending}
          disabled={!photoFile}
          className="w-full sm:w-auto"
        >
          {pending ? "Creating your preview…" : "Create My Artwork Preview"}
        </Button>
        <p className="mt-3 text-xs text-[#8a7968]">
          Your preview will be created from your photo. You&rsquo;ll only be charged
          if you choose to order.
        </p>
      </div>
    </form>
  );
}
