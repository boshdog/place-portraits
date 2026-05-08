import type { ArtStyle } from "@/types";

export interface StyleOption {
  key: ArtStyle;
  label: string;
  description: string;
  moodWords: string[];
}

export const ART_STYLES: StyleOption[] = [
  {
    key: "classic_watercolour",
    label: "Classic Watercolour",
    description:
      "Soft, romantic watercolour textures with gentle colours and warm natural light.",
    moodWords: ["Soft", "Warm", "Romantic"],
  },
  {
    key: "elegant_line_wash",
    label: "Elegant Line & Wash",
    description:
      "Refined ink linework with delicate watercolour washes — clean, minimal, timeless.",
    moodWords: ["Clean", "Minimal", "Refined"],
  },
  {
    key: "signature_illustrated",
    label: "Signature Illustrated",
    description:
      "A warm, polished illustrated portrait — charming, detailed and beautifully giftable.",
    moodWords: ["Charming", "Detailed", "Giftable"],
  },
];

export function getStyle(key: ArtStyle): StyleOption | undefined {
  return ART_STYLES.find((s) => s.key === key);
}

export function getStyleLabel(key: string): string {
  const style = ART_STYLES.find((s) => s.key === key);
  return style?.label ?? key;
}
