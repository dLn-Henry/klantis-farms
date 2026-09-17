# Klantis Farms — Public Website

Next.js 14 + TypeScript + Tailwind CSS (combined with a small set of custom
component classes in `app/globals.css`).

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## What's in here

This covers the full public site (Phase 1 + 2 of the roadmap):

- Homepage
- About, Our Farm, How We Farm, Farm Transparency
- Produce directory + category pages (dynamic route)
- Shop (lightweight listing — full cart/checkout is a later Commerce phase)
- Cart (placeholder empty state — same reason as above)
- Farm Journal (blog) home + article pages (dynamic route)
- Contact, FAQ, Trust & Transparency
- Privacy Policy, Terms & Conditions (**placeholder legal text — needs a
  lawyer's review before this goes live**, flagged directly on those pages)

## Design system

Tokens live in `tailwind.config.ts`:

- `green` (#1F6B45) — primary
- `forest` (#123B2A) — dark sections, header/footer
- `mist` (#EAF4EE) — light tinted backgrounds
- `gold` (#D99A2B) — accents, ratings
- `soil` (#795548) — earth accent, used sparingly
- `ink` / `ink-soft` — text
- `border`, `surface` — neutrals

Font: Inter, loaded via `next/font/google` in `app/layout.tsx`.

Reusable custom classes (`.btn-solid`, `.photo-slot`, `.prod-card`,
`.cat-card`, `.faq-item`, etc.) live in `app/globals.css` under `@layer
components` — Tailwind utilities and custom CSS combined, as requested.

## Content that isn't hardcoded

`lib/site-config.ts` holds site-wide content — name, tagline, phone, email,
address, social links, footer text. This is a stand-in for what will later
live in the `settings` table (per the Database spec) and be editable from
`/dashboard/settings` once the admin app exists. Components import from
this file rather than hardcoding strings, so swapping in a real data
source later won't require touching component code.

## Mock data

`lib/data/mock/` holds placeholder categories, products, and farm
production data. `lib/data/repositories/` wraps that data in `async`
functions — deliberately, so that swapping mock data for a real Supabase
query later is a one-file change per repository, not a rewrite of every
page that consumes it.

## Photography

No real photos exist yet. Every image slot uses the `<PhotoSlot />`
component (`components/ui/PhotoSlot.tsx`) — a labeled placeholder telling
you exactly what photo belongs there. Search the codebase for
`<PhotoSlot` to find every spot that needs a real image.

## A note on verification

This project could not be run through `npm install` / `npm run dev` in the
environment it was built in (no package registry access there). Everything
was checked as thoroughly as possible without that:

- Every `@/...` import resolves to a real file (52 checked)
- Every bracket/brace/paren is balanced across all files
- No missing `"use client"` directives on components using hooks
- No duplicate default exports
- No unbalanced JSX `<div>` tags

That's a strong signal, not a guarantee. Please run `npm install && npm run
dev` on your end as the real first test, and let me know immediately if
anything doesn't compile — I'd rather fix it now than have you debug a
project you didn't write.
