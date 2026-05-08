/**
 * Gemini API client factory.
 *
 * NOTE: The Google Generative AI SDK supports text generation and multimodal
 * input. For image *generation* (Imagen 3), you use the REST API directly via
 * the predict endpoint, as Imagen 3 is not yet fully exposed in the Node SDK.
 *
 * TODO: Confirm the exact Imagen 3 / Gemini image-generation endpoint and
 * payload when your API access is provisioned. See README for details.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!_client) {
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _client;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function isDevMockEnabled(): boolean {
  return (
    process.env.DEV_MOCK_GENERATION === "true" ||
    !process.env.GEMINI_API_KEY
  );
}
