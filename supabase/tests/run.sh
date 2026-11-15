#!/usr/bin/env bash
# Runs the permission test-suite against a THROWAWAY local Postgres (never your
# Supabase project). Needs a local server you can `createdb` on, e.g.:
#     export PGHOST=localhost PGUSER=postgres     # and PGPASSWORD if needed
# It builds a scratch database "klantis_test" from migrations 0001..0017, seeds
# members with single roles (the shape of a real pre-0018 database), applies
# 0018, then runs the suite. Prints PASS/FAIL lines and a total.
#
# Supabase's own pieces (auth schema, roles, storage tables) are stubbed in
# stub_supabase.sql -- enough for RLS and trigger logic to behave the same.
set -euo pipefail
cd "$(dirname "$0")/.."
DB=klantis_test
psql -q -d postgres -c "drop database if exists $DB" -c "create database $DB"
for r in anon authenticated service_role; do
  psql -q -d postgres -c "do \$\$ begin if not exists (select 1 from pg_roles where rolname='$r') then create role $r nologin $( [ $r = service_role ] && echo bypassrls ); end if; end \$\$"
done
P="psql -q -v ON_ERROR_STOP=1 -d $DB"
$P -f tests/stub_supabase.sql
for f in $(ls migrations/*.sql | sort | grep -v 0018); do $P -f "$f" 2>&1 | grep -v NOTICE || true; done
$P -f tests/0018_seed.sql
$P -f migrations/0018_roles_permissions.sql 2>&1 | grep -v NOTICE || true
psql -q -d $DB -f tests/0018_permissions.test.sql 2>&1 \
  | sed 's/^psql:[^ ]* *//; s/^NOTICE:  //' | grep -E '^(PASS|FAIL)' | tee /tmp/klantis_test_results.txt
echo "TOTAL: PASS=$(grep -c ^PASS /tmp/klantis_test_results.txt) FAIL=$(grep -c ^FAIL /tmp/klantis_test_results.txt || true)"
