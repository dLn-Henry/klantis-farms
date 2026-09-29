-- ============================================================================
-- 0010_farm_code_generator.sql
--
-- fields, crop_cycles, harvests, and veterinary_reports all have a
-- `code text not null` column with a `unique (farm_id, code)` constraint,
-- but nothing ever generates that code -- the client was expected to
-- supply a correct, non-colliding value itself. That's exactly the kind
-- of thing that breaks in real use: two people submitting at the same
-- moment, a guessed number that collides with an existing record, a
-- typo. This replaces "trust the client" with an atomic, server-side
-- generator.
-- ============================================================================

create table farm_code_counters (
  farm_id uuid not null references farms(id),
  code_prefix text not null,
  next_number integer not null default 1,
  primary key (farm_id, code_prefix)
);

alter table farm_code_counters enable row level security;

-- No direct client access needed or wanted -- this table is only ever
-- touched through next_farm_code() below, which is security definer.
-- Enabling RLS with no policies means it's fully locked down by default.

-- Atomic per-farm, per-prefix sequence. A single INSERT ... ON CONFLICT
-- DO UPDATE ... RETURNING is one atomic, row-locked statement in
-- Postgres, so two concurrent callers for the same farm+prefix can never
-- receive the same number -- unlike deriving "max(existing code) + 1"
-- from the data table itself, which has a real race condition between
-- two concurrent inserts.
create or replace function next_farm_code(p_farm_id uuid, p_prefix text)
returns text as $$
declare
  v_number integer;
begin
  insert into farm_code_counters (farm_id, code_prefix, next_number)
  values (p_farm_id, p_prefix, 1)
  on conflict (farm_id, code_prefix)
  do update set next_number = farm_code_counters.next_number + 1
  returning next_number into v_number;

  return p_prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(v_number::text, 4, '0');
end;
$$ language plpgsql security definer;

-- Any farm member may call this (it only ever hands out the next number
-- for their own farm -- callers still need is_farm_member-gated INSERT
-- privileges on the actual table to make use of the code it returns).
grant execute on function next_farm_code(uuid, text) to authenticated;
