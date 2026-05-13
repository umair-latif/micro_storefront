# Micro Storefront Project Overview

This document is a handoff map for AI assistants and developers. It explains what the project is, how it is structured today, what was recently stabilized, and where the project can go next.

## Current State

Micro Storefront is a Next.js + Supabase application for creating lightweight public storefront pages. A store owner can log in to an admin dashboard, create or select a store, customize its profile, add categories, manage products, configure landing blocks and themes, then publish a public storefront at `/:slug`.

The app is in a working experimental baseline on branch `codex/experiments`. Lint and production build pass after the cleanup commit `8173525`.

## Repository Shape

The actual app lives in `nextjs/`.

- `nextjs/app/`: Next.js App Router pages, layouts, route handlers, and server actions.
- `nextjs/components/`: Shared UI components for public storefront and marketing/admin surfaces.
- `nextjs/lib/`: Supabase clients, theme resolution, shared types, defaults, and storage cleanup helpers.
- `nextjs/supabase/schema.sql`: Database/schema bootstrap script. This was updated to better match the current app code.
- `nextjs/public/brand/`: Brand and marketing images.
- `nextjs/docs/PHASE2_STORE_FRONT.md`: Older planning notes for the public storefront redesign. It contains encoding artifacts and should not be treated as perfectly current.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Supabase Auth, Database, and Storage
- Tailwind CSS
- Lucide React icons
- dnd-kit for sortable landing blocks
- Markdown rendering via `react-markdown`

Important package state:

- Next is currently `^14.2.35`.
- Supabase JS is currently `^2.105.4`.
- ESLint is configured with `next/core-web-vitals`.
- `npm run lint` passes.
- `npm run build` passes.
- `npm audit --omit=dev` still reports Next-related advisories that npm says require a breaking upgrade to Next 16.

## Main Product Areas

### Public Storefront

Primary route: `nextjs/app/(public)/[slug]/page.tsx`

The storefront:

- Fetches a public profile by slug.
- Reads `storefront_config`.
- Resolves theme tokens via `nextjs/lib/theme.ts`.
- Renders configured landing blocks.
- Supports top header/hero modes.
- Supports category wall/slider views.
- Supports product grid, list, and link-style views.
- Links into category pages and product detail pages.

Related files:

- `nextjs/app/(public)/[slug]/c/[cat]/page.tsx`
- `nextjs/app/(public)/[slug]/p/[id]/page.tsx`
- `nextjs/components/storefront/StorefrontHeader.tsx`
- `nextjs/components/storefront/ProductViews.tsx`
- `nextjs/components/storefront/ProductCard.tsx`
- `nextjs/components/storefront/CategorySlider.tsx`
- `nextjs/components/storefront/CategoryListView.tsx`
- `nextjs/components/storefront/CTAButtons.tsx`
- `nextjs/components/storefront/SocialLinks.tsx`

### Admin Dashboard

Primary admin layout: `nextjs/app/admin/layout.tsx`

The admin dashboard:

- Requires Supabase auth via `nextjs/middleware.ts`.
- Shows store selection in `StoreSwitcher`.
- Lets owners edit profile data, images, socials, products, categories, themes, and landing blocks.
- Uses `owner_uid` checks in queries and mutations.

Related files:

- `nextjs/app/admin/profile/page.tsx`
- `nextjs/app/admin/profile/actions.ts`
- `nextjs/app/admin/products/page.tsx`
- `nextjs/app/admin/products/ui/ProductsManager.tsx`
- `nextjs/app/admin/products/ui/ProductEditorModal.tsx`
- `nextjs/app/admin/categories/page.tsx`
- `nextjs/app/admin/categories/ui/CategoriesManager.tsx`
- `nextjs/app/admin/categories/ui/CategoryForm.tsx`
- `nextjs/app/admin/storefront/page.tsx`
- `nextjs/app/admin/storefront/actions.ts`
- `nextjs/app/admin/storefront/ui/LandingEditor.tsx`
- `nextjs/app/admin/storefront/ui/ThemeEditor.tsx`
- `nextjs/app/admin/storefront/ui/BackgroundEditorRow.tsx`

### Supabase Integration

Server-side Supabase clients:

- `nextjs/lib/supabase-server.ts`: read-oriented server component client with no-op cookie writes.
- `nextjs/lib/supabase-ssr-server.ts`: server action/client capable of setting cookies.

Client-side Supabase:

- `nextjs/lib/supabase-client.ts`

Auth middleware:

- `nextjs/middleware.ts`

Database schema:

- `nextjs/supabase/schema.sql`

Expected buckets:

- `product-images`
- `profile-images`
- `category-images`

## Data Model

Core tables:

- `profiles`: public store identity, slug, images, social config, storefront config, owner id, public flag.
- `categories`: profile-linked category names, cover image, order position.
- `products`: profile/category-linked product data, image, price, visibility, CTAs.
- `analytics_clicks`: generic CTA/source click records.
- `analytics_views`: storefront view pings.
- `analytics_cta_clicks`: simpler CTA click records.

Important JSON columns:

- `profiles.socials_config`: scalable social links.
- `profiles.storefront_config`: theme, layout, top section, landing blocks, defaults.

## Recent Stabilization Work

The latest cleanup baseline did the following:

- Switched work to `codex/experiments`.
- Updated dependencies within the current Next 14 line.
- Added `.eslintrc.json`.
- Fixed lint blockers in admin UI code.
- Removed debug logging from the public storefront page.
- Normalized analytics route validation and payload handling.
- Updated `components/storefront/Analytics.tsx` to send `profileId`.
- Expanded `supabase/schema.sql` to include app-required columns and analytics tables.
- Added storage policies for product, profile, and category images.
- Verified `npm run lint`.
- Verified `npm run build`.

## Known Issues And Risks

### 1. Next Security Advisories Remain

`npm audit --omit=dev` still reports Next-related vulnerabilities. npm recommends `npm audit fix --force`, which would move to Next 16 and may require a migration.

Next step: plan a dedicated Next 16 upgrade branch and test all routes carefully.

### 2. Schema May Still Differ From Production

`schema.sql` now better matches the app, but it has not been verified against the actual Supabase project. Treat it as an improved bootstrap/migration reference, not guaranteed production truth.

Next step: compare this file to the live Supabase schema and convert it into proper migrations.

### 3. RLS Needs A Serious Review

The app has owner checks in code and a stronger schema than before, but RLS policy correctness should be reviewed against actual user flows.

Next step: test anon public reads, authenticated owner writes, and cross-user denial cases.

### 4. Analytics Is Basic

Analytics endpoints now validate and write consistently, but tracking usage is still thin. View pings may not be wired into all public pages.

Next step: decide on one analytics model and wire public page/product CTA tracking intentionally.

### 5. Public Storefront UX Needs Browser QA

The build passes, but visual behavior has not been fully tested across mobile and desktop in a browser after the cleanup.

Next step: run the dev server, open sample storefronts, and test responsive layouts.

### 6. Encoding Artifacts Exist In Older Files

Some older docs and comments include mojibake/encoding artifacts. Most are harmless, but they make maintenance unpleasant.

Next step: clean text in docs and visible UI strings without changing behavior.

## Best Next Directions

### Foundation

1. Convert `supabase/schema.sql` into versioned migrations.
2. Add a `.env.example` with required Supabase values.
3. Add seed data for a demo storefront.
4. Add a smoke-test checklist or Playwright tests for public/admin routes.

### Security And Reliability

1. Plan and execute a Next 16 upgrade in a separate branch.
2. Audit RLS policies using real Supabase roles.
3. Validate all user-provided URLs before rendering links.
4. Add rate limiting or bot protection to analytics endpoints.
5. Confirm image bucket policies cannot be abused by authenticated non-owners.

### Product Experience

1. Improve storefront previews inside admin.
2. Add live theme preview while editing.
3. Add drag-and-drop ordering for products/categories if not fully supported yet.
4. Add store onboarding after signup.
5. Add publish/unpublish controls tied clearly to `is_public`.

### Public Storefront

1. Polish mobile-first product cards.
2. Improve product detail pages with richer gallery support.
3. Add share metadata fallbacks and a real `og-default.jpg`.
4. Add configurable footer/branding.
5. Add optional link-in-bio style sections.

### Admin Maintainability

1. Split large client components into smaller pieces.
2. Replace broad `any` usage in landing/theme editor code with stricter types.
3. Centralize Supabase query helpers for products, categories, and profiles.
4. Add user-visible success/error feedback consistency.
5. Add form validation for URLs, phone numbers, slugs, and hex colors.

## Useful Commands

Run from `nextjs/`:

```bash
npm install
npm run lint
npm run build
npm run dev
npm audit --omit=dev
```

Run from repo root:

```bash
git switch codex/experiments
git status --short --branch
```

## Handoff Notes For Future AI Assistants

- Work in `nextjs/` for app changes.
- Prefer small, verified changes over broad rewrites.
- Run `npm run lint` and `npm run build` before handing back code.
- Do not assume `schema.sql` exactly matches production Supabase until checked.
- Avoid major Next upgrades in the same PR as unrelated product changes.
- Be careful with public routes under `app/(public)`: route paths omit the group name.
- Be careful with PowerShell paths containing parentheses or brackets; use `-LiteralPath`.
- If touching auth or storage, review both application checks and RLS/storage policies.
