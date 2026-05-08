import { customAlphabet } from "nanoid";

// URL-safe alphabet, no ambiguous chars (0/O, 1/l/I)
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 16);

/** Generate a unique, unguessable preview token for /preview/[token]. */
export function generatePreviewToken(): string {
  return nanoid();
}
