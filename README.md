# Klantis Farms

A farm operating system with a public website and (soon) a marketplace.
Next.js 14 + React 18 + TypeScript + Tailwind CSS, on Supabase
(PostgreSQL, Auth, Row-Level Security).

Start here:

| Read | For |
|---|---|
| `ARCHITECTURE.md` | The stack, routes and data model as actually built (wins over the design docs) |
| `SUPABASE_SETUP.md` | Connecting a Supabase project and applying migrations |
| `BUILD_LOG.md` | Migration history, conventions, real-vs-mock status. **Read before adding a migration or write path.** |
| `ROADMAP.md` | Phased plan |

## Run it

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase URL + anon key
npm run dev                        # http://localhost:3000
```

Then follow `SUPABASE_SETUP.md` to apply **all** migrations
(`supabase/migrations/0001` ... `0016`, in order) and verify with
`supabase/verify_schema.sql`.

## What's here

- **Public site** (`app/(marketing)`): home, about, farm, how we farm,
  transparency, produce, shop, cart, journal (blog), contact, FAQ, trust,
  privacy, terms. Privacy and Terms are **placeholder legal text and need a
  lawyer's review before launch.**
- **Auth** (`app/(auth)`).
- **Dashboard** (`app/dashboard`): livestock, crops, fields, harvests,
  inventory ledger, veterinary reports with approval, tasks, finance,
  suppliers, equipment, customers, orders, blog, team, audit log. Products
  and Settings are not yet real (see `ROADMAP.md`).

## Design system

Tokens in `tailwind.config.ts`: `green` #1F6B45 (primary), `forest`
#123B2A, `mist` #EAF4EE, `gold` #D99A2B, `soil` #795548, `ink`/`ink-soft`,
`border`, `surface`. Font: Inter via `next/font/google`. Reusable classes
(`.btn-solid`, `.prod-card`, `.cat-card`, ...) live in `app/globals.css`.

## Photography

Real photos don't exist yet; image slots use `<PhotoSlot />`
(`components/ui/PhotoSlot.tsx`). Search for `<PhotoSlot` to find every slot.

## Verify before you push

```bash
npx tsc --noEmit
npm run build
```
