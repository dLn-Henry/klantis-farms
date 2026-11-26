#!/usr/bin/env bash
# Runs the permission test-suites against THROWAWAY local Postgres databases
# (never your Supabase project). Needs a local server you can `createdb` on:
#     export PGHOST=localhost PGUSER=postgres      # and PGPASSWORD if needed
#
#  suite 0018  DB built 0001..0017, seeded with single-role members (the shape
#              of a real pre-0018 database), then 0018 applied, then tested.
#  suite 0019  same start, then 0018 + 0019 applied, extra people seeded, tested.
#
# Supabase's own pieces (auth schema, roles, storage tables) are stubbed in
# stub_supabase.sql -- enough for RLS and trigger logic to behave the same.
set -euo pipefail
cd "$(dirname "$0")/.."
for r in anon authenticated service_role; do
  psql -q -d postgres -c "do \$\$ begin if not exists (select 1 from pg_roles where rolname='$r') then create role $r nologin $( [ $r = service_role ] && echo bypassrls ); end if; end \$\$"
done

build() {  # $1 = db name, $2 = last migration number to apply (inclusive)
  psql -q -d postgres -c "drop database if exists $1" -c "create database $1"
  local P="psql -q -v ON_ERROR_STOP=1 -d $1"
  $P -f tests/stub_supabase.sql
  for f in $(ls migrations/*.sql | sort); do
    n=$(basename "$f" | cut -c1-4)
    [ "$n" -le 0017 ] && $P -f "$f" 2>&1 | grep -v NOTICE || true
  done
  $P -f tests/0018_seed.sql
  for f in $(ls migrations/*.sql | sort); do
    n=$(basename "$f" | cut -c1-4)
    if [ "$n" -ge 0018 ] && [ "$n" -le "$2" ]; then $P -f "$f" 2>&1 | grep -v NOTICE || true; fi
  done
}
run_suite() {  # $1 = db, $2.. = sql files (harness first)
  local db=$1; shift
  cat "$@" > /tmp/klantis_suite.sql
  psql -q -d "$db" -f /tmp/klantis_suite.sql 2>&1 \
    | sed 's/^psql:[^ ]* *//; s/^NOTICE:  //' | grep -E '^(PASS|FAIL)' || true
}

TOTAL_PASS=0; TOTAL_FAIL=0
echo "### suite 0018"; build klantis_test18 0018
run_suite klantis_test18 tests/0018_permissions.test.sql | tee /tmp/r18.txt
echo "### suite 0019"; build klantis_test19 0019
psql -q -v ON_ERROR_STOP=1 -d klantis_test19 -f tests/0019_seed.sql
run_suite klantis_test19 tests/harness.sql tests/0019_boundaries.test.sql | tee /tmp/r19.txt
echo "### suite 0020"; build klantis_test20 0020
psql -q -v ON_ERROR_STOP=1 -d klantis_test20 -f tests/0019_seed.sql
psql -q -v ON_ERROR_STOP=1 -d klantis_test20 -f tests/0020_seed.sql
run_suite klantis_test20 tests/harness.sql tests/0020_site.test.sql | tee /tmp/r20.txt
cat /tmp/r18.txt /tmp/r19.txt /tmp/r20.txt > /tmp/klantis_test_results.txt
echo "TOTAL: PASS=$(grep -c '^PASS' /tmp/klantis_test_results.txt) FAIL=$(grep -c '^FAIL' /tmp/klantis_test_results.txt || true)"
