alter table public.business_submissions
  add column if not exists moderation_score integer check (moderation_score >= 0 and moderation_score <= 100),
  add column if not exists moderation_decision text check (moderation_decision in ('auto_publish', 'pending_review', 'auto_hold')),
  add column if not exists moderation_notes text[] not null default '{}',
  add column if not exists published_business_id uuid references public.businesses(id) on delete set null;

alter table public.product_submissions
  add column if not exists moderation_score integer check (moderation_score >= 0 and moderation_score <= 100),
  add column if not exists moderation_decision text check (moderation_decision in ('auto_publish', 'pending_review', 'auto_hold')),
  add column if not exists moderation_notes text[] not null default '{}';

drop policy if exists "Public can read verified directory records" on public.businesses;

create policy "Public can read published directory records"
on public.businesses
for select
using (verification_status in ('verified', 'community_submitted', 'disputed'));
