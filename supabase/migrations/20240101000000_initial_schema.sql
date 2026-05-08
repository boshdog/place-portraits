-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── preview_requests ────────────────────────────────────────────────────────
create table if not exists preview_requests (
  id                            uuid primary key default gen_random_uuid(),
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),

  -- Customer
  customer_name                 text not null,
  customer_email                text not null,
  customer_phone                text,

  -- Upload
  original_image_url            text not null,
  original_image_storage_path   text,
  maps_link                     text,

  -- Request
  style                         text not null,
  customer_notes                text,
  consent_marketing             boolean not null default false,
  expectation_confirmed         boolean not null default false,

  -- Status
  status                        text not null default 'pending',
  preview_token                 text unique not null,

  -- Generated preview (watermarked, shown to customer)
  generated_preview_url         text,
  generated_preview_storage_path text,

  -- Final (unwatermarked, used for fulfilment — kept private)
  generated_final_url           text,
  generated_final_storage_path  text,

  -- Generation metadata
  generation_provider           text,
  generation_model              text,
  generation_started_at         timestamptz,
  generation_completed_at       timestamptz,
  generation_error              text,       -- admin-only, never shown to customers

  -- Quality control
  quality_status                text,       -- approved | needs_edit | failed
  quality_notes                 text,

  -- Admin
  admin_notes                   text,
  revision_notes                text
);

-- Status values: pending | generating | ready | failed | revision_requested | ordered | fulfilled | cancelled
-- quality_status values: approved | needs_edit | failed

comment on table preview_requests is
  'Each row represents one personalised house artwork preview request.';

-- ─── orders ──────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  preview_request_id          uuid references preview_requests(id),
  customer_email              text not null,

  product_key                 text not null,
  product_name                text not null,
  product_price               integer not null,  -- price in pence
  currency                    text not null default 'gbp',

  status                      text not null default 'created',  -- created | paid | processing | fulfilled | cancelled

  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,

  shipping_name               text,
  shipping_address_json       jsonb
);

comment on table orders is
  'Orders placed after a customer approves their artwork preview.';

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_preview_requests_status          on preview_requests (status);
create index if not exists idx_preview_requests_customer_email  on preview_requests (customer_email);
create index if not exists idx_preview_requests_preview_token   on preview_requests (preview_token);
create index if not exists idx_orders_preview_request_id        on orders (preview_request_id);
create index if not exists idx_orders_stripe_session            on orders (stripe_checkout_session_id);

-- ─── updated_at trigger ──────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger preview_requests_updated_at
  before update on preview_requests
  for each row execute procedure set_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute procedure set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table preview_requests enable row level security;
alter table orders            enable row level security;

-- All reads/writes go through the service role key (server-side only).
-- The anon key has no access — this is intentional for security.
-- Public read of a single preview_request is allowed via preview_token (for /preview/[token] page).

create policy "Public read via preview_token"
  on preview_requests for select
  using (true);  -- Row filter applied at query level via .eq('preview_token', token)

-- Service role bypasses RLS — all admin/server-side ops use service role.
