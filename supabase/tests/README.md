# Database tests

Live tests for the authorization model (migration 0018). They run against a
**scratch local Postgres**, never your Supabase project:

    export PGHOST=localhost PGUSER=postgres
    ./supabase/tests/run.sh

Covers: permission resolution per role, table access (a Farm Worker can no
longer see finance), several roles combining, Owner-only role assignment and
its safeguards, approval guards, stock-adjustment permission, complete-only
tasks, blog/media/settings, anonymous visitors, the read-only Auditor, and the
Platform Super Administrator. When you add a table or change a policy, add a
case here in the same commit (see BUILD_LOG.md).
