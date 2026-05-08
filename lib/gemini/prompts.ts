import type { ArtStyle } from "@/types";

const BASE_RULES = `
Key rules for all styles:
- Preserve key architecture as faithfully as possible.
- Keep the house clearly recognisable — roofline, door position, main windows, chimney if visible, garden wall or fence if important.
- Make the artwork beautiful, premium and giftable.
- Remove or soften visual clutter (cars, bins, temporary objects) where appropriate, unless they are clearly part of the permanent architecture.
- Do not add fantasy elements, cartoon effects, or cheap filter looks.
- Do not add text, numbers, logos, or signage.
- Do not invent major building features that are not present in the photo.
- Maintain a portrait-friendly composition with suitable margins for framing.
- Keep the result suitable for A5, A4 and A3 prints.
- Avoid heavy shadows or muddy colours.
- Keep the artwork tasteful and suitable for home decor.
- Do not include people or animals.
`.trim();

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  classic_watercolour: `
Create a beautiful personalised watercolour artwork based on the uploaded house photo.
Preserve the recognisable structure, roofline, door position, main windows, garden wall, fence, and key architectural features.
Beautify the scene with soft natural light, delicate watercolour texture, gentle sky, tasteful greenery and a warm premium gift-art feel.
Keep the home recognisable but slightly romanticised.
Create an elegant portrait suitable for a framed personalised home artwork.
  `.trim(),

  elegant_line_wash: `
Create a premium architectural line-and-wash illustration based on the uploaded house photo.
Preserve the recognisable structure, perspective, roofline, door position, main windows, garden wall, fence, and key architectural features.
Use refined ink linework, light watercolour washes, clean negative space, soft neutral tones and a tasteful home-decor feel.
The result should look elegant, minimal, refined and suitable for a framed personalised house portrait.
  `.trim(),

  signature_illustrated: `
Create a warm polished illustrated home portrait based on the uploaded house photo.
Preserve the recognisable structure, roofline, door position, main windows, garden wall, fence, and important architectural details.
Make the house feel charming, clean, welcoming and giftable, with attractive natural light, subtle texture, refined details and a premium modern illustration feel.
The result should be recognisable but beautifully interpreted.
  `.trim(),
};

/**
 * Sanitise customer notes — accept helpful instructions, soften unsafe ones.
 * The AI provider receives this appended to the main prompt.
 */
function sanitiseCustomerNotes(notes: string): string {
  const trimmed = notes.trim().slice(0, 500); // hard cap
  // Strip attempts to inject conflicting instructions
  return trimmed.replace(
    /(ignore previous|forget|override|system:|assistant:|SYSTEM|<\/?[a-z]+>)/gi,
    ""
  );
}

/**
 * Build the full generation prompt for a given style and optional customer notes.
 *
 * TODO: If switching to a provider that supports separate system/user messages,
 * refactor to return { systemPrompt, userPrompt } instead.
 */
export function buildPrompt(style: ArtStyle, customerNotes?: string): string {
  const stylePrompt = STYLE_PROMPTS[style];
  let prompt = `${stylePrompt}\n\n${BASE_RULES}`;

  if (customerNotes) {
    const safe = sanitiseCustomerNotes(customerNotes);
    if (safe.length > 0) {
      prompt += `\n\nAdditional notes from the customer (apply where reasonable and consistent with the above rules):\n${safe}`;
    }
  }

  return prompt;
}
