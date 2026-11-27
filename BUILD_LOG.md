# Build Log

Read this before adding a migration, converting a repository, or adding a
write path. It exists so the next piece of work reuses what's already
here instead of duplicating or contradicting it. Update it as part of
the same commit whenever something in this list changes.

## Migrations, in order

| File | What it does |
|---|---|
| `0001_core.sql` | Identity: users/profiles, organizations, farms, farm_members, roles. `is_farm_member()` helper (security definer, avoids RLS recursion on farm_members). |
| `0002_farm_records.sql` | Livestock, crops, fields, veterinary_reports, harvests. Farm-scoped `for all using (is_farm_member(farm_id))` policies throughout. |
| `0003_inventory.sql` | inventory_items / inventory_transactions. Ledger trigger (`apply_inventory_transaction`) is the only thing meant to change `quantity`. |
| `0004_commerce.sql` | products, customers, orders, order_items. |
| `0005_business_ops.sql` | suppliers, supplier_purchases, equipment, maintenance_records, expenses, income_records. |
| `0006_content_and_system.sql` | blog_posts, audit_log (append-only, has its own trigger), settings, notifications. |
| `0007_rls_patch_reference_tables.sql` | RLS for species/breeds/crop_types/product_categories/roles. Idempotent (drop-if-exists + create) — safe to run twice, safe on a fresh DB even though 0001/0002/0004 now also create these policies. |
| `0008_role_enforcement_and_gaps.sql` | `has_farm_role()` helper. BEFORE UPDATE approval guards on veterinary_reports/harvests (no self-review, role-restricted). `orders.payment_status` and `inventory_items.quantity` locked to service_role / the ledger trigger via **revoke-whole-table-then-grant-an-allowlist** (a column-specific REVOKE alone does NOT retract an already-granted whole-table privilege — verified live, don't redo that mistake). Customer self-access SELECT policies. Co-member profile visibility. `settings.is_public`. |
| `0009_tasks.sql` | tasks table. `completed_at` is derived by trigger from status, never independently settable. |
| `0010_farm_code_generator.sql` | `next_farm_code(farm_id, prefix)` — atomic, race-free per-farm-per-prefix counter (`INSERT ... ON CONFLICT DO UPDATE ... RETURNING`). Produces `PREFIX-YYYY-NNNN`. **Use this for any new farm-scoped `code` column** — don't hand-roll another generator. |
| `0011_insert_guards.sql` | BEFORE INSERT guards: veterinary_reports/harvests can't be inserted pre-approved or with a forged submitter/recorder; tasks can't be created with a forged `created_by` or assigned to someone outside the farm. All skip when `auth.uid()` is null (service_role/migrations). |
| `0012_cross_farm_references.sql` | **`guard_same_farm_reference()`** — one generic trigger, parameterized per table, that checks a referencing column's target row belongs to the same farm. Attached to all 10 FK relationships between farm-scoped tables (found by querying the catalog, not by guessing). Also: inventory transactions lock the row and refuse to go negative (`SELECT ... FOR UPDATE`, verified under real concurrency), forged `created_by` rejected. search_path pinned on every SECURITY DEFINER function. **Any new FK between two farm-scoped tables needs a `guard_ref_*` trigger added here, same pattern.** |
| `0013_numeric_sanity_checks.sql` | CHECK constraints (NOT VALID) on every numeric column that had none — amounts > 0, quantities, coordinates, rating range. **Check this file before adding a new numeric column elsewhere; add a constraint here if it doesn't already exist.** |
| `0014_audit_coverage.sql` | **`log_audit_event()`** — one generic, parameterized AFTER trigger (`TG_ARGV[0]` = entity label, `TG_ARGV[1]` = label column) attached to harvests, orders, tasks, crop_cycles, animals, suppliers, equipment, expenses, income_records, inventory_transactions, maintenance_records. Logs minimal facts only (what/to what/by whom/status transition) — never a row snapshot, because expenses/orders carry money and the log is readable. Update-without-status-change is not logged. Read access to audit_log narrowed from any farm member to Farm Owner/Manager. **Any new write-path table should get an `audit_*` trigger using this function.** |
| `0015_team_management.sql` | **Closed a hole in 0010:** `next_farm_code` had no membership check and was executable by PUBLIC, so a worker on one farm (or an anonymous visitor) could burn another farm's numbering and spam junk prefix rows. Now: farm-membership check, fixed prefix allow-list (**add new prefixes in that function**), EXECUTE revoked from public/anon. **Team management as database functions** — `list_farm_team`, `add_farm_member`, `set_member_role`, `set_member_status` — instead of table policies: only a Farm Owner can add/re-role/suspend; nobody can change their own role or status; a farm always keeps one active owner; every change is audit-logged; emails only shown to owner/manager. `farm_members` itself still has NO client write policy (verified a direct UPDATE/INSERT is refused). |
| `0016_blog_hardening.sql` | **Blog.** Public read = Published, or Scheduled whose `published_at` has passed (computed in the policy at query time, no cron). Old `for all` policy split into INSERT/UPDATE only; DELETE revoked. `guard_blog_post()` trigger: anyone on the farm can write Drafts; anything that is, was, or becomes Published/Scheduled needs Farm Owner/Manager; Scheduled requires a date; Published auto-dates (a past-due Scheduled post keeps its date); author can't be forged, farm/author immutable. `author_name` is a trigger snapshot via `safe_author_name()` so anonymous visitors never read `profiles` -- it **never returns an email** (`handle_new_user` in 0001 defaults `display_name` to the email, so the snapshot uses first+last name, else a display_name without `@`, else "Farm team"). NOT VALID CHECKs: slug format/length/`new` reserved, title/excerpt/body/category sizes. Audited via `log_audit_event('Blog Post','title')`. |

### 0017 - media storage + library (Phase 1A)
Two buckets: `site-media` (public: logo, favicon, blog/product images) and
`private-media` (members only, signed URLs: vet photos/PDFs). Every object
lives under `<farm_id>/...`; `storage_path_farm()` extracts that segment
(returns NULL, never raises, on a malformed path) and the `storage.objects`
policies key on it. `media` table records each upload; file facts are
immutable (trigger), only alt text is editable. 5 MB cap and a MIME allowlist
(**no SVG** -- it can carry script) enforced by the bucket *and* table
CHECKs. Uploads go browser -> Storage directly (Vercel caps request bodies at
~4.5 MB); `registerMedia()` then downloads the object, sniffs its magic bytes
(`lib/media/sniff.ts`) and deletes it if it isn't what it claims. Tested live:
cross-farm / malformed-path / outsider / anon inserts refused; vet can't delete
someone else's file; table CHECKs reject svg, pdf-in-public, >5 MB, foreign
path, spoofed uploader.

### 0018 - permission-based roles, several roles per person (Phase 1B)
Before this, only approvals checked roles: every other table let ANY member
read and write everything (a Farm Worker could edit finance). Now
`permissions` (74 `module.action` keys) + `role_permissions` (data, changed only
by migration) + `farm_member_roles` (a person may hold several roles; access is
the UNION). `has_permission(farm, key)` is what every table policy and guard
asks; `has_farm_role()` still works across all of a person's roles. `farm_members.role_id`
is dropped (it was a second source of truth). Roles: the original six plus
Accountant, Agronomist, Equipment Officer, Procurement Officer, Auditor
(read-only everywhere). **Only a Farm Owner can assign roles**
(`team.assign_roles` is held by no other role; `verify_schema.sql` fails if
it ever is), nobody can change their own roles, a farm keeps >= 1 active Owner,
every member keeps >= 1 role, and role changes are audited. Guards moved to
permissions: vet review (`veterinary.review`), harvest approval
(`harvests.approve`), blog publish (`content.publish`), manual stock
"Adjustment" (`inventory.adjust`, new), and a person with only
`tasks.complete` may change only the status of a task assigned to them.
Storage policies follow `media.*`. **Platform Super Administrator** =
`platform_admins` table (SQL-editor/service-role grant only): may view
farms/organizations/memberships and suspend/reactivate a farm via
`platform_set_farm_status()` (audited); sees NO operational farm data.
Tested live: `supabase/tests/run.sh` (98 cases on Postgres 16).
App side: `getAccess()` (one `my_access` RPC per request), permission-aware
sidebar, a `ModuleGate` layout on every dashboard module ("no access" screen
instead of empty tables), multi-role Users screens whose "what they can do"
list is read from the same `role_permissions` table the database enforces. If
0018 isn't applied, the dashboard shows a red banner instead of silently
hiding everything.
Adjustable decisions (data, not code): Farm Manager has no `reports.financial`
and no `finance.delete`; Farm Worker can create/edit livestock records and
create (not edit) crop activities and harvests; Veterinarians see all vet
reports (assigned-animals scoping is a later refinement).

### 0019 - strict role boundaries (Phase 1B revision)
Feedback on 0018: still too wide (a vet saw the whole animal register and the
media library; customers could reach the dashboard shell). Principle: **least
privilege, and record-level scoping where a role's job is about specific
records.** Researched how marketplaces and farm/vet software do it: one login
with separate workspaces (customer account vs seller/farm area, seller status
gated behind verification), and vets given farm-controlled, per-animal access.
- **Media library is Owner/Manager only** (`media.*`); `verify_schema.sql` fails
  if any other role gets it. Others attach files only *to a record*.
- **Veterinarian**: only `veterinary.create/edit`, `livestock.view_assigned`,
  `tasks.view_own/complete`. Sees ONLY animals with an OPEN `vet_assignments`
  row (a manager assigns; closes automatically when the vet submits), only
  their OWN reports (`submitted_by = auth.uid()`); cannot add/edit animals,
  see inventory, finance, other tasks, the team, audit or settings. Cannot
  report on an animal that isn't assigned. Cannot approve their own report.
- **Report attachments** belong to the report: private `vet-reports` bucket,
  `<farm>/<report>/<file>`, writable only by the author while the report is
  Submitted/Changes Requested, readable by the author + reviewers, max 10
  files, 5 MB, images/PDF only (server re-checks real bytes). Uploaded as part
  of submitting the report, not via the media library.
- **Tasks**: below manager, `tasks.view_own` = only tasks assigned to you.
- Matrix trimmed for every role (see role_permissions; Auditor = read-only
  everywhere except media/settings). `dashboard.overview` is a permission
  (Owner, Manager, Auditor); everyone else gets a role-specific home.
- **Customers** (anyone who is not an active farm member): own
  `/account` workspace (orders, profile, password, "Sell on Klantis" preview);
  middleware sends non-members away from `/dashboard`, the dashboard layout
  redirects them too, and RLS gives them only their own customer/orders rows.
  Farm staff reach `/account` too (they may also buy). Becoming a farmer will
  be an opt-in from this account (apply -> verification -> farm workspace).
Tested: `supabase/tests/run.sh` -- 185 cases (98 for 0018 + 87 for 0019).
Known follow-ups: dashboard home still shows sample figures for Owner/Manager
(replaced in 1H); gating of Edit/Delete buttons inside detail pages is partial
(create buttons and review controls are gated; the database refuses the rest).

### 0020 - site identity + blog images (Phase 1C)
- **Site settings are real.** Dashboard -> Settings edits `settings` rows
  (`site.*`, `contact.*`, `social.*`; public) which feed the public header,
  footer, contact page, legal pages, auth screens, browser tab icon (favicon),
  page titles/description and the link-preview (Open Graph) image. Defaults in
  `lib/site-config.ts` apply until something is saved or if the DB can't be
  reached, so a settings problem can never break the public site. Read via
  `getSiteContent()` (anon client, cached, `revalidateTag("site-settings")` on
  save). One public site for now: the farm whose `site.name` was saved first.
  Required fields saved empty fall back to defaults; optional ones (announcement,
  delivery note, social links) hide when empty.
- **`guard_settings` trigger**: only an allowlist of site/contact/social keys
  can be public (nothing sensitive can be published by mistake); social links
  must be `https://`; email must look like one; logo/favicon/share image must be
  a picture from THIS farm's `site-media` library; 600-char cap.
- **Blog**: `blog_posts.featured_image_path/alt` (alt required; image must be
  in the farm's library - trigger). Body is **Markdown** (old plain paragraphs
  render unchanged). Editor has a toolbar, live preview, featured-image picker
  and an Image button for inline pictures (MediaPicker over the media library).
  Public render uses `react-markdown` with: raw HTML dropped, links limited to
  http(s)/mailto/tel (external ones `rel="noopener noreferrer nofollow"`), and
  images ONLY from this project's public media bucket. Saving also refuses
  pictures from outside the farm's own folder.
- **`guard_media_in_use`**: an image used as logo/favicon/share image or a
  post's featured image can't be deleted from the library (farm cascade still
  works).
- Vet-report photos were delivered in 0019 (attachments belong to the report).
Tested: `supabase/tests/run.sh` (217 cases: 98 + 87 + 32 for 0020);
`npx tsx tests/markdown-safety.test.mts` (15 hostile-input cases),
`tests/images.test.mts` (8), `tests/site-settings.test.mts` (12).
Known: pages using the site name are statically cached up to 2 min / until a
save revalidates them. The Owner/Manager dashboard home still shows sample
figures (replaced in 1H). Multi-farm needs a platform-level site config (Phase 7).

### 0021 + navigation (Phase 1D)
- **Nine approved groups** (Overview, Farm Operations, Resources & Procurement,
  Workforce & Planning, Sales & Commerce, Finance, Insights & Traceability,
  Website & Content, Administration) defined ONCE in `lib/navigation.ts`, used
  by the sidebar, mobile drawer, Ctrl+K palette and quick-create. Each item has
  `status: live | planned` (planned = muted SOON tag, not a link; toggle
  "Show features coming soon") and a `perm` list so people only see what their
  roles include. `tests/navigation.test.mts` fails if: a live item has no page,
  a "planned" item already has one, a permission key isn't in the database
  catalogue, or the role-visibility expectations change (e.g. only Owner/Manager
  see Media; a vet sees Veterinary + Tasks only).
- **Ctrl/Cmd+K palette** (`CommandPalette`): go-to pages, create actions, and
  record search (`lib/actions/search.ts`: animals, crop cycles, fields, harvests,
  inventory, equipment, suppliers, customers, orders, products, tasks, vet
  reports, blog posts). Search runs through RLS, so people only find what they
  may open (a vet finds only assigned animals, a worker only their tasks);
  LIKE wildcards are escaped; 2-char minimum, 60-char cap, 4 hits per source.
- **Quick-create** "+ New" menu (desktop) and "+" sheet (mobile), filtered by
  create permissions; only pages that exist.
- **Mobile**: bottom bar (Home, the person's main section, "+", Alerts, More) and
  a slide-in drawer with the full navigation; content has bottom padding so the
  bar never covers it.
- **Preferences (migration 0021)**: `user_preferences` (own row only):
  favourites (star on hover), collapsed groups, show-planned. DB-checked: max 12
  favourites, each must look like `/dashboard/...` (no external or javascript:
  links), group names letters only. Recents are kept in localStorage (not worth a
  DB write per click). Optimistic UI, saved in the background.
- Topbar: working search + "New" menu, bell links to the Notifications page
  (an honest "coming soon" page; the fake unread dot is gone), "My account" link.
- `DashboardShell` context replaces prop-drilling; `/dashboard/*` still renders
  dynamically per request.
Tested: `supabase/tests/run.sh` 237 cases (+20 for 0021); `npx tsx
tests/navigation.test.mts` (26). Not done here (later): saved views/filters,
breadcrumbs, multi-farm switcher UI (architecture is ready: `farmId` flows from
`getAccess()`), notification counts (1F).

## Verifying a database matches the repo

`supabase/verify_schema.sql` is a read-only script (paste into the Supabase
SQL Editor): it lists every missing table, function, trigger and column,
tables with RLS off, and any SECURITY DEFINER function anonymous visitors
can call. Empty result (`OK`) = in sync. **Add new tables / functions /
triggers to its lists in the same commit as the migration that creates
them.** Symptom of a DB that is behind the repo: *"Could not find the
function public.X in the schema cache."* Fix: run the missing migrations in
order; if it persists, `notify pgrst, 'reload schema';`.

## Established patterns — reuse these, don't reinvent

- **`lib/data/current-farm.ts` → `getCurrentFarmId()`** — every create action needs this to know which farm a new row belongs to. Single farm membership only for now (no farm-switcher UI exists); has a TODO comment for when that changes.
- **`lib/actions/errors.ts` → `friendlyDbError()`** — turns a raw Postgres error into a sentence. Our own raised exceptions (guards above) are already plain-language and pass through untouched; this is for raw constraint violations (unique/check/FK).
- **Server actions**: thin. Validate input shape, call the database, relay whatever it says. The actual rule (approval gating, same-farm checks, amount > 0, stock floor) lives in the database, once, not duplicated in the action. If a new write needs a rule that isn't already covered by an existing migration, write the migration first, test it live, then build the action on top — not the other way round.
- **Forms**: client component, `useTransition`, call the action, show `result.error` directly (it's already written for a real user to read), `router.refresh()` or rely on the action's own `redirect()` after success. No local-only `useState` success that doesn't correspond to a real write — that exact anti-pattern is what the first fixes in this project had to undo.
- **EXECUTE grants on SECURITY DEFINER functions**: Postgres grants EXECUTE to PUBLIC by default, and Supabase exposes functions as RPC to anonymous callers. Every new function that is callable from the app must explicitly `revoke execute ... from public, anon` and grant only what's needed. Currently the only anon-callable ones are `is_farm_member` and `has_farm_role`, deliberately: they only evaluate the *caller's own* membership, and public RLS policies (e.g. the product catalog) call them. Re-run the audit query (SECURITY DEFINER, non-trigger, `has_function_privilege('anon', oid, 'execute')`) after adding functions.
- **Privilege-changing writes go through database functions, not table policies.** See the team functions in 0015. Open table write policies on something like `farm_members` would let a client craft arbitrary UPDATEs.
- **Showing a control is not enforcing a rule.** UI hides owner-only buttons for convenience; the database function re-checks on every call. Don't rely on the former.
- **Dead buttons**: several list pages still have a `<button>` with no `href`/`onClick` for an action that doesn't exist yet. When you build that action, go find and wire the button — don't leave it or add a second one.

## Testing discipline for anything touching the database

Don't trust a migration or an RLS policy by reading it. For every migration added in this project so far, the actual process was:
1. Spin up a real local Postgres (`apt-get install postgresql`), stub `auth.uid()`/`auth.users` to match Supabase's shape.
2. Run every migration file, in order, from a completely empty database.
3. Seed two farms and users in different roles.
4. Try to break the thing you just built as the wrong user, with a forged field, across farms — whatever the realistic attack is — and confirm it fails with a real error.
5. Then confirm the legitimate version of the same action still succeeds.

This caught real bugs that reading the SQL did not: a column-level REVOKE that silently didn't work, an INSERT-path bypass of an UPDATE-only approval guard, a cross-farm inventory write that actually succeeded and actually moved another farm's stock. Skipping this step on a new migration is how one of those gets through.

Note: this sandbox's Postgres install and the cloned repo do not persist between some tool calls (seen it reset mid-session at least once). Commit and push promptly once something is verified — don't leave multi-step work sitting uncommitted while testing continues.

## Status: real vs mock

**Real (Supabase, RLS-backed, tested)**: posts (blog), animals, audit-log, crop-cycles, customers, equipment, fields, finance, harvests, inventory, orders, suppliers, tasks, users (team), vet-reports.

**Still mock**: `products.ts`. (Settings is also unconverted — it's a form with no backend, honest about it in the UI.)

**Write paths that exist**: Add Animal, Record Harvest, Log Movement (inventory), Submit + Review Veterinary Report, Create + Update Task status, Add Team Member / Change Role / Suspend-Reactivate (owner only), Create Crop Cycle, Create + Edit Blog Post (publish/schedule gated to Owner/Manager), Add Expense, Add Income, Add Supplier, Add Equipment, Log Maintenance, Update Order (fulfillment) Status.

**Doesn't exist in any form**: checkout / order creation. Products and the public marketplace are still mock data end to end. Converting Products needs the `product_inventory_sources` linkage (spec: a product's availability should derive from inventory, not be typed in separately) done as part of the conversion, not after — flagged here so it isn't done the easy-but-wrong way.

**Known limits of team management (decisions, not oversights):**
- "Add Team Member" requires the person to have already registered; it does not email an invite or create accounts. That would need the Supabase service-role key in application code, which bypasses all RLS if misused or leaked — a decision for the owner of this project, not something to add quietly.
- It tells an owner whether an email has an account ("No account found..."), so a farm owner can check whether an address is registered. Acceptable for trusted owners; revisit before opening farm creation to the public.
- "At least one active owner" is enforced as defense in depth but can't currently be triggered through the normal paths (an acting owner can't modify themselves, so another active owner always exists). It guards against future paths.
- Role descriptions in the UI (`lib/data/role-descriptions.ts`) list only what is genuinely enforced. Most per-module permissions beyond the approvals above are NOT enforced yet — every member can record data in every module of their farm.

## Blog notes

- **Two clients, on purpose.** Public journal pages use `lib/supabase/public.ts` (cookie-less, anonymous). Dashboard reads use the session client and **filter by the member's own farm_id explicitly**, because live posts are world-readable and would otherwise leak other farms' posts into the dashboard.
- Public pages are `force-dynamic` so builds never need the database, and a post going live/unpublished shows immediately.
- Public reads never select `author_id`/`farm_id`.
- **No `dangerouslySetInnerHTML` anywhere** (checked): post bodies render as plain text paragraphs, so stored XSS can't execute. Keep it that way; if a rich-text renderer is ever added it must sanitize.
- Slug is generated server-side from the title and never changes on edit (links stay valid). Single-farm assumption: the public journal lists all live posts; add a farm filter when a second farm publishes.
