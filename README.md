# MapleChoice

Responsive web MVP for discovering Canadian small businesses and checking Canadian product status with clear evidence and confidence labels.

## Current Scope

This repository implements Milestone 1 as a Next.js web app instead of a mobile app. The product remains structured so a future Expo app can reuse the same Supabase schema and TypeScript domain logic.

Built now:

- Responsive Next.js app shell
- Discover, Search, Scan, Saved, More, Methodology, product, and business routes
- Admin shell with server-side role guard
- Supabase schema migration with RLS policies
- Development-only seed fixture file
- Shared domain logic and unit tests

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in Supabase values when connecting a real project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ACCESS_TOKEN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ENABLE_AI_MODERATION`
- `ENABLE_AI_WEB_RESEARCH`

Feature flags default off in `.env.example`.

`ENABLE_AI_WEB_RESEARCH=true` lets the business-submission moderation step use OpenAI web search for low-risk submissions only. High-risk rule results are held without web research.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
```

## Supabase

Apply migrations from `supabase/migrations`.

Development fixtures are in `supabase/seed/dev_seed.sql`. They use fictional businesses and products only.

## Deferred

- Real Supabase data fetching in public screens
- Browser camera barcode scanning
- Auth and saved-item sync
- Submission/report API handlers
- Admin CRUD and audit-log writes
- Payment support flow
