# Connecting Klantis Farms to a Real Supabase Backend

Everything up to this phase ran on mock data in `lib/data/mock/*.ts`. This
phase adds the actual database schema, real authentication, and the
infrastructure to swap mock data for real queries. Follow these steps in
order.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account if
   you don't have one.
2. Create a new project. Pick a region close to Ghana if available (e.g.
   an EU region), and set a strong database password — save it somewhere,
   you'll need it if you ever connect directly via `psql`.
3. Wait for the project to finish provisioning (a couple of minutes).

## 2. Get your API credentials

In your project dashboard: **Settings → API**.

Copy:
- **Project URL**
- **anon public** key

## 3. Set up your local environment

```bash
cp .env.local.example .env.local
```

Paste your Project URL and anon key into `.env.local`.

**This file is already in `.gitignore` — never commit it.**

## 4. Run the database migrations

In your Supabase project dashboard, go to **SQL Editor**, and run each file
in `supabase/migrations/` **in order** (the numbers matter — later files
depend on tables created by earlier ones):

1. `0001_core.sql`
2. `0002_farm_records.sql`
3. `0003_inventory.sql`
4. `0004_commerce.sql`
5. `0005_business_ops.sql`
6. `0006_content_and_system.sql`

**If you're setting up fresh, stop here — you don't need `0007`.** It's
already folded into files 0001, 0002 and 0004 above. `0007_rls_patch_reference_tables.sql`
only exists for the case where you'd already run 0001-0006 before a fix was
made to them (5 reference tables — `roles`, `species`, `breeds`,
`crop_types`, `product_categories` — were initially missing Row-Level
Security entirely, which under Supabase's default grants would have let
anyone with the public anon key modify or delete that data directly). If
that's your situation, run `0007` now and you're caught up.

Paste each file's contents into the SQL Editor and click **Run**. If
something errors, stop and read the error — don't skip ahead, since later
files reference tables from earlier ones.

Alternatively, if you have the Supabase CLI installed and your project
linked (`npx supabase link`), you can run `npx supabase db push` to apply
all migrations at once.

## 5. Load the seed data

Same process: open `supabase/seed.sql`, paste its contents into the SQL
Editor, and run it. This populates the schema with data matching what's
currently in `lib/data/mock/` so the app looks the same once connected.

## 6. Install the new dependencies

```bash
npm install
```

This phase added `@supabase/supabase-js` and `@supabase/ssr`.

## 7. Create your account and link it to the seeded farm

1. Run `npm run dev`, go to `http://localhost:3000/register`, and sign up
   with a real email address you can access.
2. Check your email for the confirmation link (Supabase sends this
   automatically) and click it.
3. In the Supabase dashboard, go to **Authentication → Users** and copy
   your new user's ID.
4. Back in the **SQL Editor**, run:

   ```sql
   insert into farm_members (farm_id, user_id, role_id)
   select '22222222-2222-2222-2222-222222222222', 'YOUR-USER-ID-HERE', id
   from roles where name = 'Farm Owner';
   ```

   (Replace `YOUR-USER-ID-HERE` with the ID you copied.)

5. Log in at `/login`. `/dashboard` is now protected by real middleware —
   you won't get in without a real session.

## What's connected vs. still mock

**Real now:**
- Authentication (login, register, logout, password reset) — via Supabase Auth
- Route protection on `/dashboard` — via `middleware.ts`
- The full database schema with Row-Level Security, matching every module
  that's been built

**Still mock data** (repositories in `lib/data/repositories/` still read
from `lib/data/mock/` arrays, not the database):
- Livestock, Crops, Fields, Harvests, Veterinary
- Inventory
- Products, Orders, Customers
- Suppliers, Equipment, Finance
- Reports, Analytics
- Blog, Users, Audit Log, Settings

This is intentional and staged on purpose. Every repository function is
already `async` specifically so that converting one to a real Supabase
query is a contained change to that single file — no page or component
needs to change when it happens. That conversion is the next phase.

## A note on verification

I can't install these packages or run this against a live Supabase project
in the environment I'm building in — no network access. Everything here is
checked as thoroughly as I can without that: the SQL is written carefully
against standard PostgreSQL/Supabase patterns, the TypeScript compiles
structurally (imports resolve, brackets balance), and the RLS policies
follow the same "farm membership gates access" pattern throughout. But the
real test is you actually running the migrations and trying to log in —
please tell me exactly what breaks if something does.
