\set QUIET on
\o /dev/null
create or replace function t_as(uid uuid) returns void language plpgsql as $$ begin
  perform set_config('request.jwt.claim.sub', coalesce(uid::text,''), false); execute 'set role authenticated'; end $$;
create or replace function t_anon() returns void language plpgsql as $$ begin
  perform set_config('request.jwt.claim.sub','', false); execute 'set role anon'; end $$;
create or replace function t_ok(n text, stmt text) returns void language plpgsql as $$ begin
  execute stmt; raise notice 'PASS  %', n;
exception when others then raise notice 'FAIL  %  -- %', n, sqlerrm; end $$;
create or replace function t_fail(n text, stmt text, expect text default null) returns void language plpgsql as $$ begin
  execute stmt; raise notice 'FAIL  %  -- expected an error, but it succeeded', n;
exception when others then
  if expect is null or sqlerrm ilike '%'||expect||'%' then raise notice 'PASS  %', n;
  else raise notice 'FAIL  %  -- wrong error: %', n, sqlerrm; end if; end $$;
create or replace function t_rows(n text, stmt text, want int) returns void language plpgsql as $$ declare c int; begin
  execute 'select count(*) from ('||stmt||') q' into c;
  if c = want then raise notice 'PASS  %', n; else raise notice 'FAIL  %  -- got % rows, wanted %', n, c, want; end if;
exception when others then raise notice 'FAIL  %  -- %', n, sqlerrm; end $$;
create or replace function t_affects(n text, stmt text, want int) returns void language plpgsql as $$ declare c int; begin
  execute stmt; get diagnostics c = row_count;
  if c = want then raise notice 'PASS  %', n; else raise notice 'FAIL  %  -- affected %, wanted %', n, c, want; end if;
exception when others then raise notice 'FAIL  %  -- %', n, sqlerrm; end $$;
grant execute on all functions in schema public to anon, authenticated;
reset role;
\o
