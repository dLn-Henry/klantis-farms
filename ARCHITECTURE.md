# Architecture (the source of truth)

This file wins over the original design documents wherever they disagree.
The design documents (Docs 1-12) describe the *vision*; several were written
before the stack was chosen and contradict each other. This is what is
actually built, and what we build on.

## Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 14** (App Router) + **React 18** + **TypeScript** |
| Styling | Tailwind CSS + a small set of component classes in `app/globals.css` |
| Backend | **Next.js server actions and server components** talking to Supabase. No separate Express/NestJS service. |
| Database | **PostgreSQL on Supabase**, with Row-Level Security |
| Auth | **Supabase Auth** (cookie sessions via `@supabase/ssr`, enforced in `middleware.ts`) |
| Files | Supabase Storage: `site-media` (public) and `private-media` (signed URLs). Browser uploads directly; the server re-verifies the real bytes. |
| Payments | **Paystack** (Phase 3) |
| Hosting | Vercel (app) + Supabase (data) |

Not used, despite appearing in some documents: Vite, Express, NestJS,
Prisma, a REST `/api/v1/*` layer. Server actions replace the REST layer for
the dashboard. Public endpoints that genuinely need HTTP (the Paystack
webhook) will be Next.js route handlers.

## Where rules live

Security and business rules live **in the database** (RLS policies, guard
triggers, security-definer functions), once. Server actions are thin: they
validate shape, call the database, and relay the error. The UI hiding a
button is convenience, never enforcement. Full conventions and the
migration history are in `BUILD_LOG.md`; read it before adding a migration.

## Routes

| Area | Prefix | Notes |
|---|---|---|
| Public site | `/`, `/about`, `/farm`, `/produce`, `/shop`, `/journal`, ... | `app/(marketing)` |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password` | `app/(auth)` |
| Farm application | **`/dashboard/*`** | `app/dashboard`, protected by middleware |

`/dashboard` is canonical. Doc 2 (Sitemap) uses `/app/*`; `/app/*`
redirects to `/dashboard/*` (see `next.config.js`) so either works, but new
links should always use `/dashboard`.

Journal (blog) lives at `/journal`, not `/blog` as some documents say.

## Data model

The **live Supabase schema is the source of truth for table and column
names**, and it is defined by `supabase/migrations/` (apply all of
`0001`-`0017` in order; check with `supabase/verify_schema.sql`).

Docs 3, 7 and 12 each describe a *different, larger* target schema with
different names (e.g. `inventory_movements` vs `inventory_transactions`,
`farm_activities`, `animal_health_records`). Treat them as a menu of future
ideas, not as the current schema. When we build a new module we add a
migration, not a rewrite of the names above.

Key shapes in use today:

- Tenancy: `organizations` -> `farms` -> farm-scoped tables (all carry
  `farm_id`); access via `farm_members` + `roles`, checked by
  `is_farm_member()` / `has_farm_role()`.
- Inventory is a **ledger**: `inventory_transactions` (via trigger) is the
  only thing that changes `inventory_items.quantity`.
- Human-readable codes come from `next_farm_code()` (e.g. `HAR-2026-0007`).
- Approvals (vet reports, harvests) are enforced by BEFORE triggers.
- Audit: `log_audit_event()` AFTER triggers write `audit_log`.

## Roadmap

Phased plan is tracked in `ROADMAP.md`.
