import type { ArtStyle } from "@/types";

export interface GenerateArtworkInput {
  previewRequestId: string;
  originalImageUrl: string;
  originalImageStoragePath?: string;
  style: ArtStyle;
  customerNotes?: string;
}

export interface GenerateArtworkResult {
  success: boolean;
  generatedImageUrl?: string;
  generatedImageStoragePath?: string;
  error?: string;
  provider?: string;
  model?: string;
}
