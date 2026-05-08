# Place Portraits — MVP

A premium personalised house artwork web app. Customers upload a photo of their home, choose an art style, and receive a watermarked preview before purchasing as a framed print, unframed print, or digital file.

## Core customer journey

1. Customer lands on homepage → clicks **Create Your Preview**
2. Uploads house photo, chooses art style, enters name & email
3. AI generates a personalised, watermarked preview
4. Customer reviews the preview and chooses a product (size/finish)
5. Proceeds to Stripe checkout → order confirmed

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database & Storage | Supabase (PostgreSQL + Storage) |
| Image generation | Gemini API (isolated adapter) |
| Payments | Stripe Checkout |
| Email | Resend (stubs to console if key absent) |
| Deployment | Vercel (recommended) |

---

## Quick start

### 1. Clone & install

```bash
git clone <repo>
cd place-portraits
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` — see comments in `.env.example` for each variable.

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration SQL in the Supabase SQL editor:
   - `supabase/migrations/20240101000000_initial_schema.sql`
3. Create storage buckets (via Supabase dashboard → Storage):
   - `house-uploads` — **private**, 15 MB limit, images only
   - `preview-images` — **public**, 20 MB limit, images only
   - `final-images` — **private**, 50 MB limit, images only
4. Copy your project URL, anon key, and service role key into `.env.local`

### 4. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)  
Use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env.local`

---

## Development mode (no API keys needed)

The app works without any external credentials:

- **No Gemini key** (`GEMINI_API_KEY` absent or `DEV_MOCK_GENERATION=true`) — generation returns a placeholder image and marks the request as ready automatically
- **No Stripe key** — checkout creates a local order record and redirects to a simulated success page
- **No Resend key** — all emails are logged to the console
- **Supabase is required** for the full request/preview flow (DB writes + Storage)

---

## Environment variables reference

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only — never expose to client |
| `GEMINI_API_KEY` | Prod | Absent = mock generation mode |
| `GEMINI_IMAGE_MODEL` | Prod | See Gemini notes below |
| `GEMINI_TEXT_MODEL` | No | Optional, for future prompt enhancement |
| `STRIPE_SECRET_KEY` | Prod | Absent = dev checkout mode |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Prod | |
| `STRIPE_WEBHOOK_SECRET` | Prod | For Stripe webhook verification |
| `RESEND_API_KEY` | Prod | Absent = emails logged to console |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password — change before deploying |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full URL e.g. `https://placeportraits.co.uk` |
| `DEV_MOCK_GENERATION` | No | Set `true` to force mock even with API key |

---

## Gemini image generation — important notes

### Which model to use

The integration is built around **Gemini 2.0 Flash with image generation**
(`gemini-2.0-flash-preview-image-generation`), which supports multimodal input
(image + text prompt) and image output.

**Set in `.env.local`:**
```
GEMINI_IMAGE_MODEL=gemini-2.0-flash-preview-image-generation
```

### Confirming the API payload

The generation code is in `lib/gemini/generateArtwork.ts` inside `generateWithGemini()`.

The current implementation:
- Fetches the source house photo
- Sends it as `inline_data` (base64) alongside the style prompt
- Expects an `inline_data` image part in the response

**TODO before going live:** Test with a real house photo and confirm:
1. The model name is correct and available in your API quota
2. `generationConfig.responseModalities: ["IMAGE"]` is accepted
3. The response structure matches the current parsing logic

If the Gemini API structure differs, update only `generateWithGemini()` in
`lib/gemini/generateArtwork.ts` — the rest of the app is unaffected.

### Switching providers

The entire AI integration sits behind a single stable interface:

```ts
generateArtworkPreview(input: GenerateArtworkInput): Promise<GenerateArtworkResult>
```

To swap providers, replace the implementation inside `lib/gemini/generateArtwork.ts`
without changing anything else. The `lib/gemini/` directory is the only place
that knows about the AI provider.

---

## Key routes

| Route | Purpose |
|---|---|
| `/` | Homepage / landing page |
| `/create` | Preview request form |
| `/preview/[token]` | Watermarked preview + product selection |
| `/checkout/success` | Order confirmation |
| `/admin` | Admin login |
| `/admin/dashboard` | List all requests with status filters |
| `/admin/requests/[id]` | Request detail + admin actions |

### API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/preview-status/[token]` | GET | Poll for preview status |
| `/api/preview/request-revision` | POST | Customer revision request |
| `/api/checkout` | POST | Create Stripe session or dev-mode order |
| `/api/webhooks/stripe` | POST | Handle `checkout.session.completed` |
| `/api/admin/requests/[id]/action` | POST | Admin actions (retry, mark ready, etc.) |
| `/api/admin/upload-preview` | POST | Admin manual preview upload |

---

## Database schema

Two main tables — see `supabase/migrations/20240101000000_initial_schema.sql`:

- **`preview_requests`** — one row per customer request; tracks upload, generation, status
- **`orders`** — one row per checkout; links to `preview_requests`

### Preview request statuses

`pending` → `generating` → `ready` → `ordered` → `fulfilled`

Also: `failed`, `revision_requested`, `cancelled`

### Quality status (admin QC)

`approved` | `needs_edit` | `failed` — stored in `quality_status` on `preview_requests`.

---

## Watermarking

**Current (MVP):** CSS overlay watermark via `.watermark-overlay` in `globals.css` and
`components/WatermarkedPreview.tsx`. The original image URL is technically accessible in source.

**Production plan:**
1. Create `/api/watermarked-preview/[token]` route
2. Fetch the stored image, composite the watermark server-side using Sharp
3. Serve the result — never expose the raw storage URL in the browser
4. Update `WatermarkedPreview.tsx` to point to this API route

---

## What is stubbed vs production-ready

| Feature | State |
|---|---|
| Supabase DB | Production-ready (needs project configured) |
| Image upload to Supabase Storage | Production-ready |
| Gemini generation | Mock works; real `generateWithGemini()` needs end-to-end test |
| Stripe Checkout | Production-ready (needs keys) |
| Stripe webhook | Implemented — needs `STRIPE_WEBHOOK_SECRET` and CLI testing |
| Email via Resend | Production-ready (needs key; falls back to console) |
| Watermarking | CSS overlay only — server-side watermarking is a TODO |
| Admin auth | Simple cookie session — sufficient for MVP |
| Rate limiting | Not implemented — TODO |
| Background job queue | Not implemented — generation is synchronous for MVP |

---

## Security notes

- Service role key, Gemini API key, and Stripe secret key are server-side only
- Admin area uses a simple signed cookie; see `lib/admin-auth.ts`
- Public preview pages use unguessable 16-character tokens (nanoid)
- File uploads are validated server-side (type + size)
- Customer notes are sanitised before being passed to the AI prompt
- **Change `ADMIN_PASSWORD` before deploying to production**

---

## Future improvements

- **Background job queue** — Move generation to a queue (Inngest, Trigger.dev, BullMQ) so requests don't block and customers get reliable email notifications
- **Server-side watermarking** — Use Sharp to composite watermarks server-side; never expose unwatermarked URLs before purchase
- **Production-grade admin auth** — Replace simple cookie with Supabase Auth or NextAuth with proper RBAC
- **Rate limiting** — Per-IP / per-email generation limits to prevent abuse
- **Stripe webhook** — Full end-to-end test including refunds and disputed charges
- **Fulfilment integration** — Connect to Gelato, Prodigi or Printful for automated print and dispatch
- **Automated email flows** — Order status updates, dispatch notification, review request sequence
- **Image upscaling / print preparation** — Upscale generated images to print resolution before fulfilment
- **Manual approval workflow** — Optional admin-approval gate before previews are shown to customers
- **A/B testing** — Test different styles, prices and copy to optimise conversion
- **Analytics** — Implement Meta Pixel, Google Analytics 4, and conversion events (stubs already in `lib/analytics.ts`)
- **Signed/private URLs** — Use Supabase signed URLs for all sensitive images (uploads, final artwork)
- **Multi-provider AI** — The `lib/gemini/` adapter can be extended to support multiple providers (Replicate, fal.ai, DALL-E, etc.) with automatic fallback
- **Revision workflow** — Structured revision request and delivery flow with email updates
- **Customer accounts** — Allow returning customers to view order history and repurchase

---

## Project structure

```
app/
  page.tsx                          Homepage
  create/
    page.tsx                        Preview request form page
    CreateForm.tsx                  Client form component
    actions.ts                      Server action: validate + create preview
  preview/[token]/
    page.tsx                        Preview page (server component)
    PreviewClient.tsx               Preview page (client, polling + checkout)
    PreviewPoller.tsx               Status polling component
  checkout/success/page.tsx         Order confirmation
  admin/
    page.tsx                        Admin login
    AdminLoginForm.tsx              Login form (client)
    actions.ts                      Login/logout server actions
    dashboard/page.tsx              Request list with status filters
    requests/[id]/page.tsx          Request detail
  api/
    preview-status/[token]/         GET status for polling
    preview/request-revision/       POST revision request
    checkout/                       POST Stripe session
    webhooks/stripe/                POST Stripe webhook
    admin/requests/[id]/action/     POST admin actions
    admin/upload-preview/           POST manual preview upload

components/
  Hero.tsx / HowItWorks.tsx / BeforeAfterExamples.tsx
  StylePreviewSection.tsx / TrustBadges.tsx
  ProductOptionsSection.tsx / Faq.tsx
  StyleSelector.tsx / ImageUpload.tsx
  WatermarkedPreview.tsx / GeneratingState.tsx / ProductSelector.tsx
  SiteHeader.tsx / SiteFooter.tsx
  ui/Button.tsx
  admin/AdminRequestTable.tsx
  admin/AdminRequestDetail.tsx

lib/
  gemini/
    client.ts           Gemini client factory + dev-mode flag
    generateArtwork.ts  Public adapter — call this, not the SDK directly
    prompts.ts          Style prompts + customer note sanitiser
    types.ts            Input/result types
  supabase/
    client.ts           Browser Supabase client
    server.ts           Server + admin (service role) clients
  admin-auth.ts         Cookie-based admin session
  analytics.ts          Event tracking stubs
  email.ts              Email helper (Resend or console)
  products.ts           Product definitions + pricing
  stripe.ts             Stripe client + checkout session helper
  styles.ts             Art style definitions
  tokens.ts             Preview token generator (nanoid)

types/index.ts          Shared TypeScript types
supabase/migrations/    SQL migration files
```
