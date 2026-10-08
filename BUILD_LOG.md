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

## Established patterns — reuse these, don't reinvent

- **`lib/data/current-farm.ts` → `getCurrentFarmId()`** — every create action needs this to know which farm a new row belongs to. Single farm membership only for now (no farm-switcher UI exists); has a TODO comment for when that changes.
- **`lib/actions/errors.ts` → `friendlyDbError()`** — turns a raw Postgres error into a sentence. Our own raised exceptions (guards above) are already plain-language and pass through untouched; this is for raw constraint violations (unique/check/FK).
- **Server actions**: thin. Validate input shape, call the database, relay whatever it says. The actual rule (approval gating, same-farm checks, amount > 0, stock floor) lives in the database, once, not duplicated in the action. If a new write needs a rule that isn't already covered by an existing migration, write the migration first, test it live, then build the action on top — not the other way round.
- **Forms**: client component, `useTransition`, call the action, show `result.error` directly (it's already written for a real user to read), `router.refresh()` or rely on the action's own `redirect()` after success. No local-only `useState` success that doesn't correspond to a real write — that exact anti-pattern is what the first fixes in this project had to undo.
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

**Real (Supabase, RLS-backed, tested)**: animals, audit-log, crop-cycles, customers, equipment, fields, finance, harvests, inventory, orders, suppliers, tasks, vet-reports.

**Still mock**: `posts.ts` (blog), `products.ts`, `users.ts`. (Settings is also unconverted — it's a form with no backend, honest about it in the UI.)

**Write paths that exist**: Add Animal, Record Harvest, Log Movement (inventory), Submit + Review Veterinary Report, Create + Update Task status, Create Crop Cycle, Add Expense, Add Income, Add Supplier, Add Equipment, Log Maintenance, Update Order (fulfillment) Status.

**Doesn't exist in any form**: checkout / order creation. Products and the public marketplace are still mock data end to end. Converting Products needs the `product_inventory_sources` linkage (spec: a product's availability should derive from inventory, not be typed in separately) done as part of the conversion, not after — flagged here so it isn't done the easy-but-wrong way.
