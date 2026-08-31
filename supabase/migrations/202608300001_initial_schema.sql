create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'moderator', 'admin');
create type public.ownership_status as enum ('canadian_owned', 'partially_canadian_owned', 'foreign_owned', 'unknown');
create type public.canada_product_status as enum ('product_of_canada', 'made_in_canada', 'manufactured_in_canada', 'designed_in_canada', 'canadian_brand_imported', 'not_canadian', 'unknown');
create type public.verification_status as enum ('verified', 'community_submitted', 'needs_review', 'disputed', 'rejected');
create type public.confidence_level as enum ('high', 'medium', 'low', 'unknown');
create type public.evidence_entity_type as enum ('business', 'product');
create type public.evidence_source_type as enum ('official_company_website', 'official_product_label', 'government_or_regulatory', 'verified_retailer_or_manufacturer', 'reputable_news', 'community_submission', 'ai_inference');
create type public.submission_status as enum ('pending', 'approved', 'rejected');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'rejected');
create type public.feed_media_type as enum ('image', 'video');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  story text,
  city text,
  province text,
  country text not null default 'Canada',
  website_url text,
  logo_url text,
  hero_media_url text,
  ownership_status public.ownership_status not null default 'unknown',
  small_business boolean not null default true,
  verification_status public.verification_status not null default 'needs_review',
  confidence public.confidence_level not null default 'unknown',
  last_verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.business_category_links (
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid not null references public.business_categories(id) on delete cascade,
  primary key (business_id, category_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text unique,
  name text not null,
  brand_name text not null,
  business_id uuid references public.businesses(id) on delete set null,
  description text,
  image_url text,
  canada_status public.canada_product_status not null default 'unknown',
  manufacturing_country text,
  manufacturing_region text,
  verification_status public.verification_status not null default 'needs_review',
  confidence public.confidence_level not null default 'unknown',
  last_verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_barcode_idx on public.products (barcode);
create index products_name_idx on public.products using gin (to_tsvector('english', name || ' ' || brand_name));
create index businesses_name_idx on public.businesses using gin (to_tsvector('english', name || ' ' || coalesce(city, '') || ' ' || coalesce(province, '')));

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.product_category_links (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.product_categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table public.alternatives (
  id uuid primary key default gen_random_uuid(),
  source_product_id uuid not null references public.products(id) on delete cascade,
  alternative_product_id uuid not null references public.products(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  reason text not null,
  created_at timestamptz not null default now(),
  unique (source_product_id, alternative_product_id)
);

create table public.evidence_sources (
  id uuid primary key default gen_random_uuid(),
  entity_type public.evidence_entity_type not null,
  entity_id uuid not null,
  source_type public.evidence_source_type not null,
  source_url text,
  source_title text,
  extracted_claim text not null,
  publisher text,
  published_at date,
  retrieved_at timestamptz not null default now(),
  confidence public.confidence_level not null default 'unknown',
  is_primary_source boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.saved_businesses (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table public.saved_products (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.product_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references auth.users(id) on delete set null,
  barcode text,
  product_name text,
  brand_name text,
  image_urls text[] not null default '{}',
  claimed_origin text,
  source_url text,
  status public.submission_status not null default 'pending',
  moderator_notes text,
  created_at timestamptz not null default now()
);

create table public.business_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references auth.users(id) on delete set null,
  business_name text not null,
  website_url text,
  province text,
  category text,
  why_it_belongs text,
  image_url text,
  evidence_url text,
  status public.submission_status not null default 'pending',
  moderator_notes text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  entity_type text not null check (entity_type in ('business', 'product', 'evidence')),
  entity_id uuid not null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);

create table public.canadian_choices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  product_id uuid references public.products(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  amount_cad numeric(10, 2),
  created_at timestamptz not null default now(),
  check (user_id is not null or anonymous_session_id is not null),
  check (product_id is not null or business_id is not null),
  check (amount_cad is null or (amount_cad >= 0 and amount_cad <= 10000))
);

create index canadian_choices_actor_idx on public.canadian_choices (coalesce(user_id::text, anonymous_session_id), created_at desc);

create table public.feed_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  media_type public.feed_media_type not null default 'image',
  media_url text,
  headline text not null,
  body text not null,
  sort_weight integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id text,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'moderator')
  );
$$;

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_categories enable row level security;
alter table public.business_category_links enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_category_links enable row level security;
alter table public.alternatives enable row level security;
alter table public.evidence_sources enable row level security;
alter table public.saved_businesses enable row level security;
alter table public.saved_products enable row level security;
alter table public.product_submissions enable row level security;
alter table public.business_submissions enable row level security;
alter table public.reports enable row level security;
alter table public.canadian_choices enable row level security;
alter table public.feed_items enable row level security;
alter table public.analytics_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "Public can read verified directory records" on public.businesses for select using (verification_status in ('verified', 'disputed'));
create policy "Public can read categories" on public.business_categories for select using (true);
create policy "Public can read business category links" on public.business_category_links for select using (true);
create policy "Public can read products" on public.products for select using (verification_status in ('verified', 'needs_review', 'disputed'));
create policy "Public can read product categories" on public.product_categories for select using (true);
create policy "Public can read product category links" on public.product_category_links for select using (true);
create policy "Public can read alternatives" on public.alternatives for select using (true);
create policy "Public can read evidence" on public.evidence_sources for select using (true);
create policy "Public can read published feed" on public.feed_items for select using (published = true);

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Users update own profile except role" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = 'user');

create policy "Users manage saved businesses" on public.saved_businesses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage saved products" on public.saved_products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users submit products" on public.product_submissions for insert with check (submitted_by is null or submitted_by = auth.uid());
create policy "Users read own product submissions" on public.product_submissions for select using (submitted_by = auth.uid() or public.is_admin());
create policy "Users submit businesses" on public.business_submissions for insert with check (submitted_by is null or submitted_by = auth.uid());
create policy "Users read own business submissions" on public.business_submissions for select using (submitted_by = auth.uid() or public.is_admin());
create policy "Users submit reports" on public.reports for insert with check (reporter_id is null or reporter_id = auth.uid());
create policy "Users read own reports" on public.reports for select using (reporter_id = auth.uid() or public.is_admin());
create policy "Anyone records Canadian choices" on public.canadian_choices for insert with check (true);
create policy "Users read own choices" on public.canadian_choices for select using (user_id = auth.uid() or public.is_admin());
create policy "Anyone logs analytics" on public.analytics_events for insert with check (true);

create policy "Admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage businesses" on public.businesses for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage business categories" on public.business_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage business category links" on public.business_category_links for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage product categories" on public.product_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage product category links" on public.product_category_links for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage alternatives" on public.alternatives for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage evidence" on public.evidence_sources for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage submissions" on public.product_submissions for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage business submissions" on public.business_submissions for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage reports" on public.reports for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage feed" on public.feed_items for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read analytics" on public.analytics_events for select using (public.is_admin());
create policy "Admins read audit logs" on public.audit_logs for select using (public.is_admin());
