-- ─── Storage Buckets ─────────────────────────────────────────────────────────
-- Run this via the Supabase dashboard or CLI if using managed Supabase.
-- Buckets are created via the Storage API / dashboard, not SQL.
-- These SQL comments document the intended bucket setup.

-- Bucket: house-uploads
--   Purpose: customer-uploaded house photos
--   Public: false (use signed URLs)
--   File size limit: 15MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- Bucket: preview-images
--   Purpose: AI-generated watermarked preview images shown to customers
--   Public: true (or use signed URLs — switch to signed in production)
--   File size limit: 20MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- Bucket: final-images
--   Purpose: unwatermarked final artwork (for fulfilment, admin only)
--   Public: false (signed URLs only, never exposed to customer before payment)
--   File size limit: 50MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- To create these programmatically using the Supabase client (run in a setup script):
-- supabase.storage.createBucket('house-uploads', { public: false, fileSizeLimit: 15728640 })
-- supabase.storage.createBucket('preview-images', { public: true, fileSizeLimit: 20971520 })
-- supabase.storage.createBucket('final-images', { public: false, fileSizeLimit: 52428800 })
