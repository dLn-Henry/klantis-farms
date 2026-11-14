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

In your Supabase project dashboard, go to **SQL Editor**. Open each file in
`supabase/migrations/`, paste it in, click **Run**, and **do them one at a
time, in numeric order**. Later files depend on earlier ones. If one errors,
stop and read the error; don't skip ahead.

Run **every** file, `0001` through `0017` (see `BUILD_LOG.md` for what each
one does). `0007` is safe to run even if you've effectively got it already
(it is idempotent).

> **Why all of them matters.** The app calls database functions such as
> `next_farm_code`, `list_farm_team` and `add_farm_member`, and relies on
> tables like `tasks`. Those are created by `0008`-`0017`. If only the
> early files were run, saving a harvest, vet report, crop cycle, supplier,
> equipment item or task fails with:
> *"Could not find the function public.next_farm_code(p_farm_id, p_prefix)
> in the schema cache."*

### Already ran some of them? Check where you are

Paste `supabase/verify_schema.sql` into the SQL Editor and run it. It is
read-only and lists every missing table, function, trigger and column. An
empty list (just an `OK` row) means you're fully caught up. Run the missing
migrations in order, then run it again.

### If the error persists after everything is applied

Supabase's API layer can hold a stale copy of the schema. Run once:

```sql
notify pgrst, 'reload schema';
```

(or Dashboard -> Settings -> API -> reload schema cache).

Alternatively, with the Supabase CLI installed and the project linked
(`npx supabase link`), `npx supabase db push` applies all migrations at once.

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

See **`BUILD_LOG.md` -> "Status: real vs mock"** -- it is the maintained,
up-to-date list. In short: everything in the dashboard except Products and
Settings is backed by Supabase with RLS; the public shop/products and
checkout are not yet real.
